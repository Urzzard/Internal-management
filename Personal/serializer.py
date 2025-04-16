from rest_framework import serializers
from .models import Personal, Staff, PCampo, Rango, Pcasa, Psubcontrato, Psindicato, Gremio 
from django.contrib.auth.models import User

class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class AdminUserManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_staff']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }

    def update(self, instance, validated_data):
        validated_data.pop('is_superuser', None)
        validated_data.pop('is_staff', None)
        validated_data.pop('password', None)

        return super().update(instance, validated_data)

class AdminUserCreateSerrializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_staff=True,
            is_superuser=False,
            is_active=True,
        )

        #AQUI PODEMOS AGREGAR LA LOGICA PARA EL RESETEO DE PASSWORD Y ENVIAR AL CORREO

        return user
    



class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
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
        model = Personal
        fields = ['id', 'nombre', 'a_paterno', 'a_materno', 'dni', 'email']

class StaffSerializer(serializers.ModelSerializer):
    user = BasicUserSerializer(read_only=True)
    personal = PersonalInfoBasicaSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.filter(is_staff=True, is_superuser=False, staff__isnull=True),
        source='user',
        write_only=True,
        label="Usuario del Sistema"
    )

    personal_id = serializers.PrimaryKeyRelatedField(
        queryset=Personal.objects.filter(staff_info__isnull=True),
        source='personal',
        write_only=True,
        label="Registro de Personal"
    )

    class Meta:
        model = Staff
        fields = ['id', 'user', 'personal', 'cargo', 'rm', 'user_id', 'personal_id']
        read_only_fields = ['id', 'user', 'personal']
    
    def create(self, validated_data):
         
        staff = Staff.objects.create(**validated_data)
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
