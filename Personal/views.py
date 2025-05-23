from rest_framework.response import Response
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
from rest_framework.decorators import action
from django.template.loader import render_to_string
from weasyprint import HTML
from django.utils import timezone
from django.db import transaction
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

#NEW SERIALIZERS

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

