from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets, status
from django.shortcuts import render
from .serializer import PersonalSerializer, StaffSerializer, PCampoSerializer, RangoSerializer, PcasaSerializer, PsubcontratoSerializer, PsindicatoSerializer, GremioSerializer
from .models import Personal, Staff, PCampo, Rango, Pcasa, Psubcontrato, Psindicato, Gremio
from rest_framework.permissions import IsAuthenticated, IsAdminUser

# Create your views here.


class PersonalView(viewsets.ModelViewSet):
    serializer_class = PersonalSerializer
    queryset = Personal.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        #print("Archivos recibidos:", request.FILES)

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
    
        

class StaffView(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    queryset = Staff.objects.select_related('personal', 'user').all()
    permission_classes = [IsAuthenticated, IsAdminUser]

class RangoView(viewsets.ModelViewSet):
    serializer_class = RangoSerializer
    queryset = Rango.objects.all()

class GremioView(viewsets.ModelViewSet):
    serializer_class = GremioSerializer
    queryset = Gremio.objects.all()

class PCampoView(viewsets.ModelViewSet):
    serializer_class = PCampoSerializer
    queryset = PCampo.objects.all()

class PcasaView(viewsets.ModelViewSet):
    serializer_class = PcasaSerializer
    queryset = Pcasa.objects.all()

class PsubcontratoView(viewsets.ModelViewSet):
    serializer_class = PsubcontratoSerializer
    queryset = Psubcontrato.objects.all()

class PsindicatoView(viewsets.ModelViewSet):
    serializer_class = PsindicatoSerializer
    queryset = Psindicato.objects.all()


