from rest_framework import serializers
from .models import Usuarios, Staff, PCampo, Rango, Pcasa, Psubcontrato, Psindicato, Gremio 
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            is_staff=True
        )
        return user


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
    
class PersonalInfoBasicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = ['id', 'nombre', 'a_paterno', 'a_materno', 'dni', 'email']

class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=True)
    usuario = PersonalInfoBasicaSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset = Usuarios.objects.all(),
        source='usuario',
        write_only=True
    )

    class Meta:
        model = Staff
        fields = '__all__'
    
    """ class Meta:
        model = Staff
        fields = ['id', 'usuario_id', 'cargo', 'rm', 'user']
        read_only_fields = ['id'] """
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        usuario = validated_data.pop('usuario')
        user = User.objects.create_user(
            username=user_data['username'],
            password=user_data['password'],
            is_staff = True
        )
        
        staff = Staff.objects.create(user=user, usuario=usuario, **validated_data)
        return staff

class RangoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rango
        fields = '__all__'

class GremioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gremio
        fields = '__all__'

class PCampoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PCampo
        fields = '__all__'

class PcasaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pcasa
        fields = '__all__'

class PsubcontratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psubcontrato
        fields = '__all__'

class PsindicatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psindicato
        fields = '__all__'
