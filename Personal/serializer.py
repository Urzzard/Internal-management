from rest_framework import serializers
from .models import Usuarios, Staff, PCampo, Rango, Pcasa, Psubcontrato, Subcontrato, Psindicato, Sindicato

class UsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = '__all__'
        extra_kwargs = {
            'dni_img': {'required': False, 'allow_null': True, 'write_only': True}
        }

    def update(self, instance, validated_data):
        if 'dni_img' not in validated_data or validated_data['dni_img'] is None:
            validated_data['dni_img'] = instance.dni_img
        return super().update(instance, validated_data)
    
    def get_dni_img_name(self, obj):
        if obj.dni_img:
            return obj.dni_img.name.split('/')[-1]
        return None

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'

class PCampoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PCampo
        fields = '__all__'

class RangoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rango
        fields = '__all__'

class PcasaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pcasa
        fields = '__all__'

class PsubcontratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psubcontrato
        fields = '__all__'

class SubcontratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcontrato
        fields = '__all__'

class PsindicatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psindicato
        fields = '__all__'

class SindicatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sindicato
        fields = '__all__'