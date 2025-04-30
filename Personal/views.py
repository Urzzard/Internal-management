from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets, status, generics
from django.shortcuts import render
from .serializer import PersonalSerializer, StaffSerializer, PCampoSerializer, RangoSerializer, GremioSerializer, AdminUserCreateSerrializer, BasicUserSerializer, PersonalInfoBasicaSerializer, AdminUserManagementSerializer
from .models import Personal, Staff, PCampo, Rango, Gremio
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
import csv
from django.http import HttpResponse
from rest_framework.decorators import action
from django.template.loader import render_to_string
from weasyprint import HTML

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
    queryset = Personal.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

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
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="personal_export.csv"'

        writer = csv.writer(response)
        field_names = [field.name for field in Personal._meta.fields if field.name != 'dni_img']
        header = field_names
        writer.writerow(header)

        queryset = self.get_queryset()

        for obj in queryset:
            row = [getattr(obj, field) for field in field_names]
            writer.writerow(row)
        
        return response
    
    @action(detail=True, methods=['get'], url_path='ficha-pdf')
    def ficha_pdf(self, request, pk=None):
        try:
            personal = self.get_object()
            pcampo_data = PCampo.objects.filter(personal=personal).select_related('gremio', 'rango', 'srecomendado__user').first()
            staff_data = Staff.objects.filter(personal=personal).select_related('user').first()

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
            return HttpResponse("Error al generar el PDF", status=500)
    

class StaffView(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    queryset = Staff.objects.select_related('personal', 'user').all()
    permission_classes = [IsAuthenticated, IsAdminUser]

class EligibleUsersForStaffView(generics.ListAPIView):
    serializer_class = BasicUserSerializer
    queryset = User.objects.filter(is_staff=True, is_superuser= False, staff__isnull=True)
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
    queryset = PCampo.objects.select_related('personal', 'gremio', 'rango', 'srecomendado', 'srecomendado__user').all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

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
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="pcampo_export.csv"'
        writer = csv.writer(response)

        header = [
            'ID PCampo', 'ID Personal', 'Nombre Personal', 'Apellido Personal', 'DNI Personal',
            'ID Gremio', 'Nombre Gremio', 'ID Rango', 'Nombre Rango',
            'Estado RETCC', 'RUC (Casa)', 'Clave SOL (Casa)', 'ID Staff Rec.', 'Username Staff Rec.'
        ]
        writer.writerow(header)

        queryset = self.get_queryset()

        for obj in queryset:
            row = [
                obj.id,
                obj.personal.id,
                obj.personal.nombre,
                obj.personal.a_paterno,
                obj.personal.dni,
                obj.gremio.id if obj.gremio else '',
                obj.gremio.nombre if obj.gremio else '',
                obj.rango.id if obj.rango else '',
                obj.rango.nombre if obj.rango else '',
                obj.retcc_estado,
                obj.ruc or '', 
                obj.c_sol or '', 
                obj.srecomendado.id if obj.srecomendado else '',
                obj.srecomendado.user.username if obj.srecomendado and obj.srecomendado.user else ''
            ]
            writer.writerow(row)
        return response

""" class PcasaView(viewsets.ModelViewSet):
    serializer_class = PcasaSerializer
    queryset = Pcasa.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]

class PsubcontratoView(viewsets.ModelViewSet):
    serializer_class = PsubcontratoSerializer
    queryset = Psubcontrato.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]

class PsindicatoView(viewsets.ModelViewSet):
    serializer_class = PsindicatoSerializer
    queryset = Psindicato.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
 """

