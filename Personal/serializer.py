from rest_framework import serializers
from .models import Personal, Staff, PCampo, Rango, Gremio, Pais, Region, Provincia, Distrito, HorarioTrabajo, DetalleDiaHorario, AsignacionHorario, Marcacion, JornadaLaboral, Incidencia, CalendarioFeriado, SemanaLaboralCierre
from django.contrib.auth.models import User
from django.utils import timezone

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
    
class PaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pais
        fields = ['id', 'nombre', 'codigo', 'geoname_id']

class RegionSerializer(serializers.ModelSerializer):
    #pais = PaisSerializer(read_only=True)
    pais_id = serializers.PrimaryKeyRelatedField(queryset=Pais.objects.all(), source='pais')

    class Meta:
        model = Region
        fields = ['id', 'nombre', 'geoname_id', 'pais_id']

class ProvinciaSerializer(serializers.ModelSerializer):
    region_id = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all(), source='region')

    class Meta:
        model = Provincia
        fields = ['id', 'nombre', 'geoname_id', 'region_id']

class DistritoSerializer(serializers.ModelSerializer):
    provincia_id = serializers.PrimaryKeyRelatedField(queryset=Provincia.objects.all(), source='provincia')

    class Meta:
        model = Distrito
        fields = ['id', 'nombre', 'geoname_id', 'provincia_id']

class PersonalSerializer(serializers.ModelSerializer):
    pais_nombre = serializers.CharField(source='pais.nombre', read_only=True, allow_null=True)
    region_nombre = serializers.CharField(source='region.nombre', read_only=True, allow_null=True)
    provincia_nombre = serializers.CharField(source='provincia.nombre', read_only=True, allow_null=True)
    distrito_nombre = serializers.CharField(source='distrito.nombre', read_only=True, allow_null=True)

    pais_id = serializers.PrimaryKeyRelatedField(
        queryset = Pais.objects.all(), source='pais', write_only=True, required=False, allow_null=True
    )
    region_id = serializers.PrimaryKeyRelatedField(
        queryset = Region.objects.all(), source='region', write_only=True, required=False, allow_null=True
    )
    provincia_id = serializers.PrimaryKeyRelatedField(
        queryset = Provincia.objects.all(), source='provincia', write_only=True, required=False, allow_null=True
    )
    distrito_id = serializers.PrimaryKeyRelatedField(
        queryset = Distrito.objects.all(), source='distrito', write_only=True, required=False, allow_null=True
    )

    dni_img_url = serializers.ImageField(source='dni_img', read_only=True)

    edad = serializers.IntegerField(source='edad_calculada', read_only= True)

    class Meta:
        model = Personal
        fields = [
             'id', 'nombre', 'a_paterno', 'a_materno', 'dni', 'dni_img_url',
             'f_nacimiento', 'f_ingreso', 'edad', 'email',
             'pais_nombre', 'region_nombre', 'provincia_nombre', 'distrito_nombre',
             'cuenta_corriente', 'cci', 't_zapato', 't_polo', 't_pantalon',
             'celular', 'nro_emergencia', 'direccion', 'e_civil', 'sexo', 'estado',
             'dni_img',
             'pais_id', 'region_id', 'provincia_id', 'distrito_id',
        ]
        read_only_fields = [
            'id', 'dni_img_url', 'pais_nombre', 'region_nombre', 'provincia_nombre', 'distrito_nombre', 'edad'
        ]
        extra_kwargs = {
            'dni_img': {'required': False, 'allow_null': True, 'write_only': True},
            'pais_id': {'required': False, 'allow_null': True},
            'region_id': {'required': False, 'allow_null': True},
            'provincia_id': {'required': False, 'allow_null': True},
            'distrito_id': {'required': False, 'allow_null': True},
        }

    def update(self, instance, validated_data):
        image_update_request = self.context['request'].data.get('dni_img')
        if image_update_request == '':
            if instance.dni_img:
                instance.dni_img.delete(save=False)
            instance.dni_img = None
            validated_data.pop('dni_img', None)
        elif isinstance(image_update_request, object) and hasattr(image_update_request, 'read'):
            pass
        else:
            validated_data.pop('dni_img', None)
        """ if 'dni_img' not in validated_data or validated_data['dni_img'] is None:
            validated_data['dni_img'] = instance.dni_img """
        return super().update(instance, validated_data)
    
    """ def get_dni_img_name(self, obj):
        if obj.dni_img:
            return obj.dni_img.name.split('/')[-1]
        return None """
    
class PersonalInfoBasicaSerializer(serializers.ModelSerializer):
    distrito_nombre = serializers.CharField(source='distrito.nombre', read_only=True, allow_null=True)
    provincia_nombre = serializers.CharField(source='provincia.nombre', read_only=True, allow_null=True)
    edad = serializers.IntegerField(source='edad_calculada', read_only= True)

    class Meta:
        model = Personal
        fields = ['id', 'nombre', 'a_paterno', 'a_materno', 'dni', 'email', 'edad', 'f_ingreso', 'estado', 'distrito_nombre', 'provincia_nombre']

class StaffSerializer(serializers.ModelSerializer):
    user = BasicUserSerializer(read_only=True)
    personal = PersonalInfoBasicaSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(

        queryset = User.objects.filter(is_staff=True, is_superuser=False, staff_profile__isnull=True),
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
    gremio = GremioSerializer(read_only=True)
    rango = RangoSerializer(read_only=True)
    personal = PersonalInfoBasicaSerializer(read_only=True)
    srecomendado_info = StaffSerializer(source='srecomendado', read_only=True)

    gremio_id = serializers.PrimaryKeyRelatedField(
        queryset=Gremio.objects.all(),
        source='gremio',
        write_only=True,
        label="Registro de Gremio"
    )

    rango_id = serializers.PrimaryKeyRelatedField(
        queryset=Rango.objects.all(),
        source='rango',
        write_only=True,
        label="Registro de Rango"
    )

    personal_id = serializers.PrimaryKeyRelatedField(
        queryset=Personal.objects.filter(obrero_info__isnull=True),
        source='personal',
        write_only=True,
        label="Registro de Personal"
    )

    srecomendado_id = serializers.PrimaryKeyRelatedField(
        queryset = Staff.objects.all(), source='srecomendado', write_only=True, label="Recomendado por Staff", allow_null=True, required=False
    )

    retcc_img_url = serializers.ImageField(source='retcc_img', read_only=True)
    sdni_img_hijo_url = serializers.ImageField(source='sdni_img_hijo', read_only=True)

    class Meta:
        model = PCampo
        fields = ['id',  'personal', 'gremio', 'rango', 'retcc_img_url', 'retcc_estado', 'srecomendado_info', 'ruc', 'c_sol', 'sdni_img_hijo_url', #LECTURA
                   'personal_id', 'gremio_id', 'rango_id', 'retcc_img', 'retcc_estado', 'srecomendado_id', 'ruc', 'c_sol', 'sdni_img_hijo' #ESCRITURA
                   ]
        read_only_fields = ['id', 'personal', 'gremio', 'rango', 'retcc_img_url', 'sdni_img_hijo_url', 'srecomendado_info']
        extra_kwargs = {
            'retcc_img': {'required': False, 'allow_null': True, 'write_only': True},
            'sdni_img_hijo': {'required': False, 'allow_null': True, 'write_only': True},
            'ruc': {'required': False, 'allow_null': True},
            'c_sol': {'required': False, 'allow_null': True},
            'srecomendado_id': {'required': False, 'allow_null': True},
            'rango_id': {'required': True}
        }

    def _handle_image_update(self, instance, field_name, validated_data):
        image_update_request = self.context['request'].data.get(field_name)
        current_image = getattr(instance, field_name, None)

        if image_update_request == '':
            if current_image:
                current_image.delete(save=False)

            setattr(instance, field_name, None)
            validated_data.pop(field_name, None)
        
        elif isinstance(image_update_request, object) and hasattr(image_update_request, 'read'):
            pass
        else:
            validated_data.pop(field_name, None)

    def update(self, instance, validated_data):

        self._handle_image_update(instance, 'retcc_img', validated_data)
        self._handle_image_update(instance, 'sdni_img_hijo', validated_data)
        
        new_gremio = validated_data.get('gremio', instance.gremio)

        if new_gremio:
            gremio_nombre_lower = new_gremio.nombre.lower()

            if 'casa' not in gremio_nombre_lower:
                validated_data['srecomendado'] = None
                validated_data['ruc'] = None
                validated_data['c_sol'] = None

            if 'sindicato' not in gremio_nombre_lower:
                pass

        return super().update(instance, validated_data)  
    
    def validate(self, data):
        gremio = data.get('gremio')
        is_update = self.instance is not None

        if not gremio and is_update:
            gremio = self.instance.gremio

        if not gremio:
            return data
        
        gremio_nombre_lower = gremio.nombre.lower()
        errors = {}

        if 'casa' in gremio_nombre_lower:
            if not data.get('srecomendado') and not (is_update and self.instance.srecomendado):
                pass
            
            if not data.get('ruc'):
                errors['ruc'] = "RUC es requerido para el gremio CASA"
            if not data.get('c_sol'):
                errors['c_sol'] = "Clave SOL es requerido para el gremio CASA"

        elif not is_update:
            data['srecomendado'] = None
            data['ruc'] = None
            data['c_sol'] = None

        if 'sindicato' in gremio_nombre_lower:
            dni_img_hijo = data.get('sdni_img_hijo')

            """ if not dni_img_hijo and not (is_update and self.instance.sdni_img_hijo):
                errors['sdni_img_hijo'] = "Imagen DNI Hijo es requerido para SINDICATO" """
            pass

        elif not is_update:
            data['sdni_img_hijo'] = None

        retcc_estado = data.get('retcc_estado')
        retcc_img = data.get('retcc_img')
        if retcc_estado != 'No tiene':
            if not retcc_img and not (is_update and self.instance.retcc_img):
                errors['retcc_img'] = "Imagen RETCC es requerida si el estado no es 'No tiene'."

        elif not is_update:
            data['retcc_img'] = None

        if errors:
            raise serializers.ValidationError(errors)
        
        return data

    """ def update(self, instance, validated_data):
        image_update_request = self.context['request'].data.get('retcc_img')

        if image_update_request == '':

            if instance.retcc_img:
                instance.retcc_img.delete(save=False)
            instance.retcc_img = None
            validated_data.pop('retcc_img', None)
        elif isinstance(image_update_request, object) and hasattr(image_update_request, 'read'):
            pass
        else:
            validated_data.pop('retcc_img', None)
        
        return super().update(instance, validated_data) """
    
class DetalleDiaHorarioSerializer(serializers.ModelSerializer):
    dia_semana_display = serializers.CharField(source='get_dia_semana_display', read_only=True)

    class Meta:
        model = DetalleDiaHorario
        fields = [
            'id', 'horario_trabajo', 'dia_semana', 'dia_semana_display', 'es_laborable', 'hora_entrada_teorica',
            'hora_inicio_tolerancia_entrada', 'hora_fin_tolerancia_entrada', 'hora_inicio_descanso_teorica',
            'hora_fin_descanso_teorica', 'duracion_descanso_teorico', 'hora_salida_teorica', 'horas_jornada_teorica'
        ]


class HorarioTrabajoSerializer(serializers.ModelSerializer):
    detalles_dias = DetalleDiaHorarioSerializer(many=True, required=False)

    class Meta:
        model = HorarioTrabajo
        fields = ['id', 'nombre', 'descripcion', 'hs_dominical', 'activo', 'detalles_dias']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles_dias', [])
        horario = HorarioTrabajo.objects.create(**validated_data)
        for detalle_data in detalles_data:
            DetalleDiaHorario.objects.create(horario_trabajo=horario, **detalle_data)
        return horario
    
    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles_dias', None)

        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.hs_dominical = validated_data.get('hs_dominical', instance.hs_dominical)
        instance.activo = validated_data.get('activo', instance.activo)
        instance.save()

        if detalles_data is not None:
            instance.detalles_dias.all().delete()
            for detalle_data in detalles_data:
                DetalleDiaHorario.objects.create(horario_trabajo=instance, **detalle_data)

        return instance
    
    #REVISAR SI ESTO SOLO PERMITE QUE LA ASIGNACION DE HORARIOS SEA UNICA
    
class AsignacionHorarioSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoBasicaSerializer(source='personal', read_only=True)
    horario_trabajo_info = HorarioTrabajoSerializer(source='horario_trabajo', read_only=True)

    personal_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), source='personal', write_only=True)
    horario_trabajo_id = serializers.PrimaryKeyRelatedField(queryset=HorarioTrabajo.objects.filter(activo=True), source='horario_trabajo', write_only=True)

    class Meta:
        model = AsignacionHorario
        fields = [
            'id', 'personal_info', 'horario_trabajo_info', 'fecha_inicio', 'fecha_fin', 'activo',
            'personal_id', 'horario_trabajo_id'
        ]
        read_only_fields = ['id', 'personal_info', 'horario_trabajo_info']

    def validate(self, data):
        personal = data.get('personal')
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')

        if personal and fecha_inicio:
            qs = AsignacionHorario.objects.filter(personal=personal, activo=True)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            for asignacion_existente in qs:
                if fecha_fin and asignacion_existente.fecha_fin:
                    if max(fecha_inicio, asignacion_existente.fecha_inicio) <= min(fecha_fin, asignacion_existente.fecha_fin):
                        raise serializers.ValidationError(f"{personal} ya tiene una asignación activa que se solapa en este rango de fechas.")
                elif fecha_fin is None and asignacion_existente.fecha_fin is None:
                     raise serializers.ValidationError(f"{personal} ya tiene una asignación activa indefinida.")
        return data
    
class MarcacionSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoBasicaSerializer(source='personal', read_only=True)
    creado_por_username = serializers.CharField(source='creado_por.username', read_only=True, allow_null=True)
    editado_por_username = serializers.CharField(source='editado_por.username', read_only=True, allow_null=True)
    personal_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), source='personal')

    class Meta:
        model = Marcacion
        fields = [
            'id', 'personal_info', 'fecha_hora_marcada', 'fecha_hora_efectiva', 'tipo_marcacion',
            'metodo_marcacion', 'origen_marcacion', 'foto_evidencia', 'latitud', 'longitud',
            'creado_por_username', 'fecha_creacion', 'editado_por_username', 'fecha_edicion',
            'motivo_edicion', 'es_correccion_manual',
            'personal_id'
        ]
        read_only_fields = ['id', 'personal_info', 'creado_por_username', 'fecha_creacion', 'editado_por_username', 'fecha_edicion']
        extra_kwargs = {
            'foto_evidencia': {'required': False, 'allow_null': True},
            # 'creado_por': {'write_only': True, 'required': False, 'allow_null': True}, # Se manejará en la vista
            # 'editado_por': {'write_only': True, 'required': False, 'allow_null': True}, # Se manejará en la vista
        }

    def create(self, validated_data):
        if 'fecha_hora_efectiva' not in validated_data or not validated_data['fecha_hora_efectiva']:
            validated_data['fecha_hora_efectiva'] = validated_data['fecha_hora_marcada']
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get('es_correccion_manual') and not instance.fecha_edicion:
             validated_data['fecha_edicion'] = timezone.now()
        validated_data.setdefault('fecha_hora_efectiva', instance.fecha_hora_efectiva)
        return super().update(instance, validated_data)
    
    
class JornadaLaboralSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoBasicaSerializer(source='personal', read_only=True)
    detalle_dia_horario_info = DetalleDiaHorarioSerializer(source='detalle_dia_horario_aplicado', read_only=True)
    marcacion_entrada_info = MarcacionSerializer(source='marcacion_entrada', read_only=True)
    marcacion_inicio_descanso_info = MarcacionSerializer(source='marcacion_inicio_descanso', read_only=True)
    marcacion_fin_descanso_info = MarcacionSerializer(source='marcacion_fin_descanso', read_only=True)
    marcacion_salida_info = MarcacionSerializer(source='marcacion_salida', read_only=True)
    personal_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), source='personal', write_only=True)
    detalle_dia_horario_aplicado_id = serializers.PrimaryKeyRelatedField(queryset=DetalleDiaHorario.objects.all(), source='detalle_dia_horario_aplicado', write_only=True)

    class Meta:
        model = JornadaLaboral
        fields = [
            'id', 'personal_info', 'fecha', 'detalle_dia_horario_info',
            'marcacion_entrada_info', 'marcacion_inicio_descanso_info',
            'marcacion_fin_descanso_info', 'marcacion_salida_info',
            'minutos_tardanza_calculados', 'horas_normales_calculadas',
            'horas_extra_potenciales', 'horas_extra_aprobadas',
            'estado_marcaciones', 'estado_jornada', 'aplica_dominical_calculado',
            'observaciones_supervisor', 'es_cerrada',
            # Campos para escritura si se crea/actualiza directamente
            'personal_id', 'detalle_dia_horario_aplicado_id', 'fecha', # fecha es clave aquí
            # No incluir campos calculados ni FKs a marcaciones para escritura directa
        ]
        read_only_fields = [
            'id', 'personal_info', 'detalle_dia_horario_info',
            'marcacion_entrada_info', 'marcacion_inicio_descanso_info',
            'marcacion_fin_descanso_info', 'marcacion_salida_info',
            'minutos_tardanza_calculados', 'horas_normales_calculadas',
            'horas_extra_potenciales',
            'estado_marcaciones',
            'aplica_dominical_calculado',
        ]

class IncidenciaSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoBasicaSerializer(source='personal', read_only=True)
    jornada_info = JornadaLaboralSerializer(source='jornada_laboral', read_only=True, allow_null=True)
    creado_por_username = serializers.CharField(source='creado_por.username', read_only=True, allow_null=True)
    aprobado_rechazado_por_username = serializers.CharField(source='aprobado_rechazado_por.username', read_only=True, allow_null=True)
    personal_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), source='personal')
    jornada_laboral_id = serializers.PrimaryKeyRelatedField(queryset=JornadaLaboral.objects.all(), source='jornada_laboral', allow_null=True, required=False)

    class Meta:
        model = Incidencia
        fields = '__all__'
        read_only_fields = ('id', 'personal_info', 'jornada_info', 'creado_por_username', 'aprobado_rechazado_por_username', 'fecha_creacion', 'fecha_aprobacion_rechazo')
        extra_kwargs = {
            'documento_adjunto': {'required': False, 'allow_null': True},
        }

class CalendarioFeriadoSerializer(serializers.ModelSerializer):
    pais_info = PaisSerializer(source='pais', read_only=True, allow_null=True)
    region_info = RegionSerializer(source='region', read_only=True, allow_null=True)
    pais_id = serializers.PrimaryKeyRelatedField(queryset=Pais.objects.all(), source='pais', write_only=True, allow_null=True, required=False)
    region_id = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all(), source='region', write_only=True, allow_null=True, required=False)

    class Meta:
        model = CalendarioFeriado
        fields = '__all__'
        read_only_fields = ('id', 'pais_info', 'region_info')


class SemanaLaboralCierreSerializer(serializers.ModelSerializer):
    cerrada_por_username = serializers.CharField(source='cerrada_por.username', read_only=True, allow_null=True)

    class Meta:
        model = SemanaLaboralCierre
        fields = '__all__'
        read_only_fields = ('id', 'cerrada_por_username', 'fecha_cierre')