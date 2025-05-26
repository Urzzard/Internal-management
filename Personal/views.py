from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets, status, generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import render
from .serializer import (
    PersonalSerializer, StaffSerializer, PCampoSerializer, RangoSerializer, GremioSerializer, 
    AdminUserCreateSerrializer, BasicUserSerializer, PersonalInfoBasicaSerializer, AdminUserManagementSerializer, 
    PaisSerializer, RegionSerializer, ProvinciaSerializer, DistritoSerializer, HorarioTrabajoSerializer, 
    DetalleDiaHorarioSerializer, AsignacionHorarioSerializer, MarcacionSerializer, JornadaLaboralSerializer, 
    IncidenciaSerializer, CalendarioFeriadoSerializer, SemanaLaboralCierreSerializer
    )
from .models import (
    Personal, Staff, PCampo, Rango, Gremio, Pais, Region, Provincia, Distrito, 
    HorarioTrabajo, DetalleDiaHorario, AsignacionHorario, Marcacion, JornadaLaboral, 
    Incidencia, CalendarioFeriado, SemanaLaboralCierre
    )
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
import csv
from django.http import HttpResponse
from rest_framework.decorators import action, api_view, permission_classes as dec_permission_classes
from django.template.loader import render_to_string
from weasyprint import HTML
from django.utils import timezone
from django.db import transaction, models
from datetime import timedelta, datetime


class PaisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pais.objects.all()
    serializer_class = PaisSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.select_related('pais').all()
    serializer_class = RegionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['pais']
    ordering_fields = ['nombre']
    pagination_class = None

class ProvinciaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Provincia.objects.select_related('region__pais').all()
    serializer_class = ProvinciaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields  = ['region']
    ordering_fields = ['nombre']
    pagination_class = None

class DistritoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Distrito.objects.select_related('provincia__region__pais').all()
    serializer_class = DistritoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields  = ['provincia']
    ordering_fields = ['nombre']
    pagination_class = None

class AdminUserManagementView(viewsets.ModelViewSet):
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUser, IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(is_superuser=False, is_staff=True)
    
    def perform_destroy(self, instance):
        if instance.is_active:
            instance.is_active = False
            instance.save()
            Staff.objects.filter(user=instance).delete()

class AdminUserCreateView(viewsets.ModelViewSet):
    serializer_class = AdminUserCreateSerrializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return User.objects.none()

class PersonalView(viewsets.ModelViewSet):
    serializer_class = PersonalSerializer
    queryset = Personal.objects.select_related('pais', 'region', 'provincia', 'distrito').all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'sexo', 'e_civil', 'pais', 'region']
    search_fields = ['nombre', 'a_paterno', 'a_materno', 'dni', 'email']
    ordering_fields = ['id', 'nombre', 'a_paterno', 'dni', 'f_ingreso', 'estado']

    def create(self, request, *args, **kwargs):
        print("Archivos recibidos:", request.FILES)

        sr = self.get_serializer(data=request.data)
        sr.is_valid(raise_exception=True)
        self.perform_create(sr)

        hd = self.get_success_headers(sr.data)
        return Response(sr.data, status=status.HTTP_201_CREATED, headers=hd)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if 'dni_img' not in request.data:
            request.data._mutable = True
            request.data['dni_img'] = instance.dni_img
            request.data._mutable = False
            
        sr = self.get_serializer(instance, data=request.data, partial=True)
        sr.is_valid(raise_exception=True)
        self.perform_update(sr)
        return Response(sr.data)
    
    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv; chatset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="personal_export.csv"'

        writer = csv.writer(response)
        #field_names = [field.name for field in Personal._meta.fields if field.name != 'dni_img']
        header = [
            'ID', 'Nombre', 'A. Paterno', 'A. Materno', 'DNI', 'F. Nacimiento', 'F. Ingreso', 'Edad',
            'Email', 'Pais', 'Region', 'Provincia', 'Distrito', 'Direccion', ' Cta. Corriente', 'CCI',
            'T. Zapato', 'T. Polo', 'T. Pantalon', 'Celular', 'N. Emergencia', 'E. Civil', 'Sexo', 'Estado Actual'
        ]
        writer.writerow(header)

        queryset = self.get_queryset()

        for obj in queryset:
            row = [
                obj.id, obj.nombre, obj.a_paterno, obj.a_materno, obj.dni,
                obj.f_nacimiento, obj.f_ingreso, obj.edad_calculada, obj.email or '',
                obj.pais.nombre if obj.pais else '',
                obj.region.nombre if obj.region else '',
                obj.provincia.nombre if obj.provincia else '',
                obj.distrito.nombre if obj.distrito else '',
                obj.direccion or '',
                obj.cuenta_corriente or '', obj.cci or '',
                obj.t_zapato or '', obj.t_polo or '', obj.t_pantalon or '',
                obj.celular or '', obj.nro_emergencia or '',
                obj.e_civil or '', obj.sexo or '', obj.estado
            ]
            writer.writerow(row)
        
        return response
    
    @action(detail=True, methods=['get'], url_path='ficha-pdf')
    def ficha_pdf(self, request, pk=None):
        try:
            personal = self.get_object()
            pcampo_data = getattr(personal, 'obrero_info', None)
            staff_data = getattr(personal, 'staff_info', None)

            context = {
                'personal': personal,
                'pcampo': pcampo_data,
                'staff': staff_data,

                'dni_img_url': request.build_absolute_uri(personal.dni_img.url) if personal.dni_img else None,
                'retcc_img_url': request.build_absolute_uri(pcampo_data.retcc_img.url) if pcampo_data and pcampo_data.retcc_img else None,
                'sdni_img_hijo_url': request.build_absolute_uri(pcampo_data.sdni_img_hijo.url) if pcampo_data and pcampo_data.sdni_img_hijo else None,
            }

            html_string = render_to_string('personal/ficha_personal_template.html', context)
            html = HTML(string=html_string, base_url=request.build_absolute_uri())
            pdf_file = html.write_pdf()

            response = HttpResponse(pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="ficha_{personal.dni}_{personal.a_paterno}.pdf"'
            return response

        except Personal.DoesNotExist:
            return HttpResponse("Personal no encontrado", status=404)
        except Exception as e:
            print(f"Error generando PDF: {e}")
            return HttpResponse("Error al generar el PDF: {e}", status=500)
    

class StaffView(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    queryset = Staff.objects.select_related('personal', 'user').all()
    permission_classes = [IsAuthenticated, IsAdminUser]

class EligibleUsersForStaffView(generics.ListAPIView):
    serializer_class = BasicUserSerializer
    queryset = User.objects.filter(is_staff=True, is_superuser= False, staff_profile__isnull=True)
    permission_classes = [IsAuthenticated, IsAdminUser]

class EligiblePersonalForStaffView(generics.ListAPIView):
    serializer_class = PersonalInfoBasicaSerializer
    queryset = Personal.objects.filter(staff_info__isnull=True, obrero_info__isnull=True)
    permission_classes = [IsAuthenticated, IsAdminUser]

class RangoView(viewsets.ModelViewSet):
    serializer_class = RangoSerializer
    queryset = Rango.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]

class GremioView(viewsets.ModelViewSet):
    serializer_class = GremioSerializer
    queryset = Gremio.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]

class PCampoView(viewsets.ModelViewSet):
    serializer_class = PCampoSerializer
    queryset = PCampo.objects.select_related('personal__pais', 'personal__region', 'personal__provincia', 'personal__distrito', 'gremio', 'rango', 'srecomendado__personal', 'srecomendado__user').all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gremio', 'rango', 'retcc_estado', 'personal__pais', 'personal__region']
    search_fields = ['personal__nombre', 'personal__a_paterno', 'personal__dni', 'ruc']
    ordering_fields = ['id', 'personal__nombre', 'gremio__nombre', 'rango__nombre', 'retcc_estado']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def create(self, request, *args, **kwargs):
        print("Archivos recibidos:", request.FILES)

        sr = self.get_serializer(data=request.data)
        sr.is_valid(raise_exception=True)
        self.perform_create(sr)

        hd = self.get_success_headers(sr.data)
        return Response(sr.data, status=status.HTTP_201_CREATED, headers=hd)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if 'retcc_img' not in request.data:
            request.data._mutable = True
            request.data['retcc_img'] = instance.retcc_img
            request.data._mutable = False
            
        sr = self.get_serializer(instance, data=request.data, partial=True)
        sr.is_valid(raise_exception=True)
        self.perform_update(sr)
        return Response(sr.data)
    
    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="pcampo_export.csv"'
        writer = csv.writer(response)

        header = [
            'ID PCampo', 'DNI Personal', 'Nombre Personal', 'Apellido Personal', 'Nombre Gremio',
            'Nombre Rango', 'Estado RETCC', 'RUC (Casa)', 'Clave SOL (Casa)', 'Username Staff Rec.'
        ]
        writer.writerow(header)

        queryset = self.get_queryset()

        for obj in queryset:
            row = [
                obj.id,
                obj.personal.id,
                obj.personal.nombre,
                obj.personal.a_paterno,
                #obj.personal.dni,
                #obj.gremio.id if obj.gremio else '',
                obj.gremio.nombre if obj.gremio else '',
                #obj.rango.id if obj.rango else '',
                obj.rango.nombre if obj.rango else '',
                obj.retcc_estado,
                obj.ruc or '', 
                obj.c_sol or '', 
                #obj.srecomendado.id if obj.srecomendado else '',
                obj.srecomendado.user.username if obj.srecomendado and obj.srecomendado.user else ''
            ]
            writer.writerow(row)
        return response

#NEW VIEWS

def procesar_o_actualizar_jornada_laboral(personal_id, fecha_jornada):
    """
    Toma el ID del personal y una fecha, busca las marcaciones efectivas del día,
    y crea o actualiza el registro JornadaLaboral con los cálculos correspondientes.
    Retorna el objeto JornadaLaboral procesado o None si hay error.
    """
    try:
        personal = Personal.objects.get(pk=personal_id)
        fecha_obj = fecha_jornada
        if isinstance(fecha_jornada, str):
            fecha_obj = datetime.strptime(fecha_jornada, '%Y-%m-%d').date()

        # 1. Obtener la asignación de horario activa para este personal en esta fecha
        asignacion_activa = AsignacionHorario.objects.filter(
            personal=personal,
            fecha_inicio__lte=fecha_obj,
            activo=True
        ).filter(
            models.Q(fecha_fin__gte=fecha_obj) | models.Q(fecha_fin__isnull=True)
        ).order_by('-fecha_inicio').first()

        if not asignacion_activa:
            print(f"No se encontró asignación de horario activa para {personal} en {fecha_obj}")
            return None
        
        # 2. Obtener el DetalleDiaHorario para el día de la semana de la fecha_jornada
        dia_semana_jornada = fecha_obj.weekday()
        detalle_dia = DetalleDiaHorario.objects.filter(
            horario_trabajo=asignacion_activa.horario_trabajo,
            dia_semana=dia_semana_jornada
        ).first()

        if not detalle_dia or not detalle_dia.es_laborable:
            print(f"Día no laborable o sin detalle de horario para {personal} en {fecha_obj} ({detalle_dia.get_dia_semana_display() if detalle_dia else 'N/A'})")
            jornada, created = JornadaLaboral.objects.update_or_create(
                personal=personal,
                fecha=fecha_obj,
                defaults={
                    'detalle_dia_horario_aplicado': detalle_dia,
                    'estado_jornada': JornadaLaboral.EstadoJornada.FERIADO_NO_LABORADO if not detalle_dia or not detalle_dia.es_laborable else JornadaLaboral.EstadoJornada.PROGRAMADA,
                    'estado_marcaciones': JornadaLaboral.EstadoMarcaciones.COMPLETA if not detalle_dia or not detalle_dia.es_laborable else JornadaLaboral.EstadoMarcaciones.PENDIENTE_ENTRADA,
                }
            )
            return jornada
        
        # 3. Obtener las marcaciones efectivas del día para este personal
        start_of_day = timezone.make_aware(datetime.combine(fecha_obj, datetime.min.time()))
        end_of_day = timezone.make_aware(datetime.combine(fecha_obj, datetime.max.time()))

        marcaciones_dia = Marcacion.objects.filter(
            personal=personal,
            fecha_hora_efectiva__gte=start_of_day,
            fecha_hora_efectiva__lte=end_of_day
        ).order_by('fecha_hora_efectiva')

        m_entrada = marcaciones_dia.filter(tipo_marcacion=Marcacion.Tipo.ENTRADA).first()
        m_inicio_desc = marcaciones_dia.filter(tipo_marcacion=Marcacion.Tipo.INICIO_DESCANSO).first()
        m_fin_desc = marcaciones_dia.filter(tipo_marcacion=Marcacion.Tipo.FIN_DESCANSO).first()
        m_salida = marcaciones_dia.filter(tipo_marcacion=Marcacion.Tipo.SALIDA).last()

        # 4. Crear o actualizar JornadaLaboral
        jornada, created = JornadaLaboral.objects.update_or_create(
            personal=personal,
            fecha=fecha_obj,
            defaults={
                'detalle_dia_horario_aplicado': detalle_dia,
                'marcacion_entrada': m_entrada,
                'marcacion_inicio_descanso': m_inicio_desc,
                'marcacion_fin_descanso': m_fin_desc,
                'marcacion_salida': m_salida,
            }
        )

        # 5. Realizar Cálculos (simplificados por ahora)
        tardanza_minutos = 0
        horas_normales = timedelta()
        horas_extra_pot = timedelta()

        if m_entrada:
            hora_fin_tolerancia_dt = datetime.combine(fecha_obj, detalle_dia.hora_fin_tolerancia_entrada)
            if timezone.is_naive(hora_fin_tolerancia_dt):
                 hora_fin_tolerancia_dt = timezone.make_aware(hora_fin_tolerancia_dt)

            if m_entrada.fecha_hora_efectiva > hora_fin_tolerancia_dt:
                tardanza = m_entrada.fecha_hora_efectiva - hora_fin_tolerancia_dt
                tardanza_minutos = int(tardanza.total_seconds() / 60)

        if m_entrada and m_salida:
            tiempo_bruto_trabajado = m_salida.fecha_hora_efectiva - m_entrada.fecha_hora_efectiva
            tiempo_descanso = timedelta()

            if m_inicio_desc and m_fin_desc:
                if m_fin_desc.fecha_hora_efectiva > m_inicio_desc.fecha_hora_efectiva:
                    tiempo_descanso = m_fin_desc.fecha_hora_efectiva - m_inicio_desc.fecha_hora_efectiva

            tiempo_neto_trabajado = tiempo_bruto_trabajado - tiempo_descanso
            horas_jornada_teorica_td = timedelta(hours=float(detalle_dia.horas_jornada_teorica))

            if tiempo_neto_trabajado > horas_jornada_teorica_td:
                horas_normales = horas_jornada_teorica_td
                horas_extra_pot = tiempo_neto_trabajado - horas_jornada_teorica_td
            else:
                horas_normales = tiempo_neto_trabajado
                # Aquí podrías calcular horas faltantes si es necesario

        jornada.minutos_tardanza_calculados = tardanza_minutos
        jornada.horas_normales_calculadas = round(horas_normales.total_seconds() / 3600, 2) if horas_normales else 0.00
        jornada.horas_extra_potenciales = round(horas_extra_pot.total_seconds() / 3600, 2) if horas_extra_pot else 0.00
        # jornada.horas_extra_aprobadas = 0 # Se aprueban después

        # Determinar estado_marcaciones y estado_jornada (lógica más compleja aquí)
        if m_entrada and m_salida and (not detalle_dia.duracion_descanso_teorico > 0 or (m_inicio_desc and m_fin_desc)):
            jornada.estado_marcaciones = JornadaLaboral.EstadoMarcaciones.COMPLETA
            if tardanza_minutos > 0:
                jornada.estado_jornada = JornadaLaboral.EstadoJornada.TARDANZA
            elif jornada.horas_extra_potenciales > 0:
                 jornada.estado_jornada = JornadaLaboral.EstadoJornada.CON_HE_PENDIENTE
            else:
                jornada.estado_jornada = JornadaLaboral.EstadoJornada.PRESENTE_COMPLETA
        elif not m_entrada:
            jornada.estado_marcaciones = JornadaLaboral.EstadoMarcaciones.PENDIENTE_ENTRADA
            jornada.estado_jornada = JornadaLaboral.EstadoJornada.AUSENTE_NJ
        elif not m_salida:
            jornada.estado_marcaciones = JornadaLaboral.EstadoMarcaciones.PENDIENTE_SALIDA
            jornada.estado_jornada = JornadaLaboral.EstadoJornada.PRESENTE_INCOMPLETA
        else: # Descanso incompleto u otro
            jornada.estado_marcaciones = JornadaLaboral.EstadoMarcaciones.REQUIERE_REVISION
            jornada.estado_jornada = JornadaLaboral.EstadoJornada.PRESENTE_INCOMPLETA

        jornada.save()
        return jornada
    
    except Personal.DoesNotExist:
        print(f"Error: Personal con ID {personal_id} no encontrado.")
        return None
    except AsignacionHorario.DoesNotExist:
        print(f"Error: No hay asignación de horario para {personal_id} en {fecha_jornada}.")
        return None
    except DetalleDiaHorario.DoesNotExist:
        print(f"Error: No hay detalle de día para el horario asignado a {personal_id} en {fecha_jornada}.")
        return None
    except Exception as e:
        print(f"Error general procesando jornada para {personal_id} en {fecha_jornada}: {e}")
        # Considera loggear el traceback completo aquí para depuración
        import traceback
        traceback.print_exc()
        return None

class HorarioTrabajoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar Horarios de Trabajo y sus Detalles de Días.
    Permite crear, listar, actualizar y eliminar horarios.
    Los detalles de los días se manejan anidados.
    """
    queryset = HorarioTrabajo.objects.prefetch_related('detalles_dias').all()
    serializer_class = HorarioTrabajoSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['activo']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'activo']


class AsignacionHorarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint para asignar Horarios de Trabajo al Personal.
    """
    queryset = AsignacionHorario.objects.select_related(
        'personal__pais', 'personal__region',
        'horario_trabajo'
    ).all()
    serializer_class = AsignacionHorarioSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'personal': ['exact'],
        'personal__dni': ['exact', 'icontains'],
        'horario_trabajo': ['exact'],
        'activo': ['exact'],
        'fecha_inicio': ['exact', 'gte', 'lte'], # gte=mayor o igual, lte=menor o igual
        'fecha_fin': ['exact', 'gte', 'lte', 'isnull'],
    }
    search_fields = [
        'personal__nombre', 'personal__a_paterno', 'personal__a_materno', 'personal__dni',
        'horario_trabajo__nombre'
    ]
    ordering_fields = ['personal__a_paterno', 'horario_trabajo__nombre', 'fecha_inicio', 'activo']

    def perform_create(self, serializer):
        # Lógica adicional al crear, si es necesaria
        # Por ejemplo, asegurar que no haya solapamientos activos (aunque el serializer ya lo intenta)
        # o desactivar otras asignaciones activas para el mismo personal.
        # Esta lógica puede ser compleja.
        # personal = serializer.validated_data.get('personal')
        # if personal and serializer.validated_data.get('activo'):
        #     AsignacionHorario.objects.filter(personal=personal, activo=True).update(activo=False)
        serializer.save()

    def perform_update(self, serializer):
        # Lógica similar al crear si se activa una asignación.
        # personal = serializer.instance.personal # o serializer.validated_data.get('personal', serializer.instance.personal)
        # if personal and serializer.validated_data.get('activo'):
        #     AsignacionHorario.objects.filter(personal=personal, activo=True).exclude(pk=serializer.instance.pk).update(activo=False)
        serializer.save()

class RegistrarJornadaCompletaView(APIView):
    """
    Endpoint para registrar las 4 marcaciones de una jornada completa
    para un empleado en una fecha específica (Manera 1).
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, *args, **kwargs):
        personal_id = request.data.get('personal_id')
        fecha_str = request.data.get('fecha')

        hora_entrada_str = request.data.get('hora_entrada')
        hora_inicio_descanso_str = request.data.get('hora_inicio_descanso')
        hora_fin_descanso_str = request.data.get('hora_fin_descanso')
        hora_salida_str = request.data.get('hora_salida')
        es_jornada_normal_teorica = request.data.get('es_jornada_normal', False)

        if not personal_id or not fecha_str:
            return Response({"error": "personal_id y fecha son requeridos."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_obj = datetime.strptime(fecha_str, '%Y-%m-%d').date()
            personal = Personal.objects.get(pk=personal_id)
        except ValueError:
            return Response({"error": "Formato de fecha inválido. Usar YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        except Personal.DoesNotExist:
            return Response({"error": f"Personal con ID {personal_id} no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        asignacion = AsignacionHorario.objects.filter(
            personal=personal, fecha_inicio__lte=fecha_obj, activo=True
        ).filter(models.Q(fecha_fin__gte=fecha_obj) | models.Q(fecha_fin__isnull=True)).first()

        if not asignacion:
             return Response({"error": f"No hay horario asignado para {personal} en {fecha_obj}."}, status=status.HTTP_400_BAD_REQUEST)

        detalle_dia = DetalleDiaHorario.objects.filter(
            horario_trabajo=asignacion.horario_trabajo, dia_semana=fecha_obj.weekday()
        ).first()

        if not detalle_dia or (not es_jornada_normal_teorica and not detalle_dia.es_laborable): # Si es manual y no laborable, error
            return Response({"error": f"Día no laborable o sin detalle de horario para {personal} en {fecha_obj}."}, status=status.HTTP_400_BAD_REQUEST)

        marcaciones_a_crear = []

        with transaction.atomic():
            # Eliminar marcaciones existentes para este día y personal si se está sobrescribiendo
            # (Ojo: decidir si esto es lo deseado o si se deben editar/añadir)
            # Por simplicidad para la Manera 1, podríamos borrar y recrear.
            Marcacion.objects.filter(
                personal=personal,
                fecha_hora_efectiva__date=fecha_obj
            ).delete() # ¡CUIDADO! Esto borra marcaciones previas del día.
                       # Considera si es mejor una lógica de actualización.

            def crear_marcacion_data(tipo_marc, hora_str, hora_teorica_default):
                if hora_str:
                    try:
                        hora_obj = datetime.strptime(hora_str, '%H:%M:%S').time()
                    except ValueError:
                        try:
                            hora_obj = datetime.strptime(hora_str, '%H:%M').time()
                        except ValueError:
                             raise ValueError(f"Formato de hora inválido para {tipo_marc.label}: {hora_str}")
                        
                elif es_jornada_normal_teorica and hora_teorica_default:
                    hora_obj = hora_teorica_default
                else:
                    return None

                fecha_hora_dt = timezone.make_aware(datetime.combine(fecha_obj, hora_obj))
                return {
                    'personal': personal,
                    'fecha_hora_marcada': fecha_hora_dt,
                    'fecha_hora_efectiva': fecha_hora_dt,
                    'tipo_marcacion': tipo_marc.value,
                    'metodo_marcacion': Marcacion.Metodo.MANUAL_SUPERVISOR, # AQUI EL TIPO DE METODO QUE SE USE
                    'creado_por': request.user if request.user.is_authenticated else None
                }
            
            try:
                marc_data = []
                data_entrada = crear_marcacion_data(Marcacion.Tipo.ENTRADA, hora_entrada_str, detalle_dia.hora_fin_tolerancia_entrada or detalle_dia.hora_entrada_teorica)
                if data_entrada: marc_data.append(Marcacion(**data_entrada))

                if detalle_dia.duracion_descanso_teorico > 0:
                    data_ini_desc = crear_marcacion_data(Marcacion.Tipo.INICIO_DESCANSO, hora_inicio_descanso_str, detalle_dia.hora_inicio_descanso_teorica)
                    if data_ini_desc: marc_data.append(Marcacion(**data_ini_desc))
                    data_fin_desc = crear_marcacion_data(Marcacion.Tipo.FIN_DESCANSO, hora_fin_descanso_str, detalle_dia.hora_fin_descanso_teorica)
                    if data_fin_desc: marc_data.append(Marcacion(**data_fin_desc))

                data_salida = crear_marcacion_data(Marcacion.Tipo.SALIDA, hora_salida_str, detalle_dia.hora_salida_teorica)
                if data_salida: marc_data.append(Marcacion(**data_salida))

                if not marc_data and not es_jornada_normal_teorica:
                     return Response({"error": "Debe ingresar al menos una hora de marcación si no es jornada normal."}, status=status.HTTP_400_BAD_REQUEST)
                
                if marc_data:
                    Marcacion.objects.bulk_create(marc_data)

            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


            jornada_procesada = procesar_o_actualizar_jornada_laboral(personal_id, fecha_obj)

            if jornada_procesada:
                serializer = JornadaLaboralSerializer(jornada_procesada)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "No se pudo procesar la jornada laboral después de crear marcaciones."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"error": "Ocurrió un error inesperado durante la transacción."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class MarcacionViewSet(viewsets.ModelViewSet):
    queryset = Marcacion.objects.select_related('personal', 'creado_por', 'editado_por').all()
    serializer_class = MarcacionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'personal': ['exact'],
        'personal__dni': ['exact', 'icontains'],
        'tipo_marcacion': ['exact'],
        'metodo_marcacion': ['exact'],
        'fecha_hora_efectiva': ['date__exact', 'date__gte', 'date__lte'],
        'es_correccion_manual': ['exact'],
    }
    search_fields = ['personal__nombre', 'personal__a_paterno', 'personal__dni', 'origen_marcacion', 'motivo_edicion']
    ordering_fields = ['fecha_hora_efectiva', 'personal__a_paterno']

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(creado_por=self.request.user)
        else:
            serializer.save()
        marcacion = serializer.instance
        procesar_o_actualizar_jornada_laboral(marcacion.personal.id, marcacion.fecha_hora_efectiva.date())


    def perform_update(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(editado_por=self.request.user, fecha_edicion=timezone.now())
        else:
            serializer.save()
        marcacion = serializer.instance
        procesar_o_actualizar_jornada_laboral(marcacion.personal.id, marcacion.fecha_hora_efectiva.date())

    def perform_destroy(self, instance):
        personal_id = instance.personal.id
        fecha_jornada = instance.fecha_hora_efectiva.date()
        super().perform_destroy(instance)
        procesar_o_actualizar_jornada_laboral(personal_id, fecha_jornada)

class JornadaLaboralViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JornadaLaboral.objects.select_related(
        'personal', 'detalle_dia_horario_aplicado__horario_trabajo',
        'marcacion_entrada', 'marcacion_inicio_descanso',
        'marcacion_fin_descanso', 'marcacion_salida'
    ).prefetch_related('incidencias')
    serializer_class = JornadaLaboralSerializer
    permission_classes = [IsAuthenticated] # Permitir a usuarios logueados (staff?) ver jornadas
                                          # O IsAdminUser si solo admins
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'personal': ['exact'],
        'personal__dni': ['exact', 'icontains'],
        'fecha': ['exact', 'gte', 'lte', 'range'],
        'estado_marcaciones': ['exact'],
        'estado_jornada': ['exact'],
        'es_cerrada': ['exact'],
        'detalle_dia_horario_aplicado__horario_trabajo': ['exact'],
        'personal__obrero_info__gremio': ['exact'],
    }
    search_fields = ['personal__nombre', 'personal__a_paterno', 'personal__dni']
    ordering_fields = ['fecha', 'personal__a_paterno', 'estado_jornada']

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reprocesar(self, request, pk=None):
        jornada = self.get_object()
        jornada_actualizada = procesar_o_actualizar_jornada_laboral(jornada.personal.id, jornada.fecha)
        if jornada_actualizada:
            serializer = self.get_serializer(jornada_actualizada)
            return Response(serializer.data)
        return Response({"error": "No se pudo reprocesar la jornada."}, status=status.HTTP_400_BAD_REQUEST)