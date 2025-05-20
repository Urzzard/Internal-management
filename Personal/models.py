from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date
from django.core.validators import MinValueValidator, MaxValueValidator
from simple_history.models import HistoricalRecords


# Create your models here.

class Pais(models.Model):
    geoname_id = models.IntegerField(unique=True, db_index=True, verbose_name="GeoName ID")
    codigo = models.CharField(max_length=2, unique=True, verbose_name="Código ISO")
    nombre = models.CharField(max_length=100, verbose_name="Nombre del Pais")
    divisa = models.CharField(max_length=3, verbose_name="Divisa del Pais")

    class Meta:
        verbose_name = "País"
        verbose_name_plural = "Paises"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre
    
    history = HistoricalRecords()

class Region(models.Model):
    geoname_id = models.IntegerField(unique=True, db_index=True, verbose_name="GeoName ID")
    pais = models.ForeignKey(Pais, on_delete=models.CASCADE, related_name='regiones')
    nombre = models.CharField(max_length=150, verbose_name="Nombre de la Region/Departamento")

    class Meta:
        verbose_name = "Región/Departamento"
        verbose_name_plural = "Regiones/Departamentos"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.pais.codigo})"
    
    history = HistoricalRecords()
    
class Provincia(models.Model):
    geoname_id = models.IntegerField(unique=True, db_index=True, verbose_name="GeoName ID")
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='provincias')
    nombre = models.CharField(max_length=150, verbose_name="Nombre de la Provincia")

    class Meta:
        verbose_name = "Provincia"
        verbose_name_plural = "Provincias"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.region.nombre})"
    
    history = HistoricalRecords()
    
class Distrito(models.Model):
    geoname_id = models.IntegerField(unique=True, db_index=True, verbose_name="GeoName ID")
    provincia = models.ForeignKey(Provincia, on_delete=models.CASCADE, related_name='distritos')
    nombre = models.CharField(max_length=150, verbose_name="Nombre del Distrito")

    class Meta:
        verbose_name = "Distrito"
        verbose_name_plural = "Distritos"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.provincia.nombre})"
    
    history = HistoricalRecords()


class Personal(models.Model):
    nombre = models.CharField(max_length=100)
    a_paterno = models.CharField(max_length=100)
    a_materno = models.CharField(max_length=100)
    dni = models.CharField(max_length=8, unique=True)
    dni_img = models.ImageField(upload_to='dni/', blank=True, null=True)
    f_nacimiento = models.DateField()
    f_ingreso = models.DateField()
    email = models.EmailField(max_length=100, blank=True, null=True)
    rfid_uid = models.CharField(max_length=50, unique=True, blank=True, null=True, verbose_name="UID Tarjeta RFID", db_index=True)

    pais = models.ForeignKey(Pais, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_pais')
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_region')
    provincia = models.ForeignKey(Provincia, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_provincia')
    distrito = models.ForeignKey(Distrito, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_distrito')

    cuenta_corriente = models.CharField(max_length=25, blank=True, null=True)
    cci = models.CharField(max_length=30, blank=True, null=True)
    t_zapato = models.CharField(max_length=4, blank=True, null=True)
    t_polo = models.CharField(max_length=4, blank=True, null=True)
    t_pantalon = models.CharField(max_length=4, blank=True, null=True)
    celular = models.CharField(max_length=15, blank=True, null=True)
    nro_emergencia = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)

    ESTADO_CIVIL_CHOICES = [('Solter@', 'Solter@'), ('Casad@', 'Casad@'), ('Divorciad@', 'Divorciad@'), ('Viud@', 'Viud@'), ('Conviviente', 'Conviviente')]
    e_civil = models.CharField(max_length=20, choices=ESTADO_CIVIL_CHOICES, blank=True, null=True)

    SEXO_CHOICES = [('Masculino', 'Masculino'), ('Femenino', 'Femenino')]
    sexo = models.CharField(max_length=20, choices=SEXO_CHOICES)

    ESTADO_PERSONAL_CHOICES = [('Activo', 'Activo'), ('Inactivo', 'Inactivo'), ('Despedido', 'Despedido'), ('Vacaciones', 'Vacaciones')]
    estado = models.CharField(max_length=20, choices=ESTADO_PERSONAL_CHOICES)

    @property
    def edad_calculada(self):
        if not self.f_nacimiento:
            return None
        today = timezone.localdate()
        return today.year - self.f_nacimiento.year - ((today.month, today.day) < (self.f_nacimiento.month, self.f_nacimiento.day))
    
    def __str__(self):
        return f"{self.nombre} {self.a_paterno} ({self.dni})"
    
    class Meta:
        verbose_name = "Personal"
        verbose_name_plural = "Personal"
        ordering = ['a_paterno', 'a_materno', 'nombre']

    history = HistoricalRecords()

class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    personal = models.OneToOneField(Personal, on_delete=models.CASCADE, related_name='staff_info')
    cargo = models.CharField(max_length=200)
    rm = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Remuneración Mensual")

    class Meta:
        verbose_name = "Staff"
        verbose_name_plural = "Staff"

    def __str__(self):
        return f"{self.user.username} - {self.personal.nombre} - {self.personal.a_paterno} - {self.cargo}"
    
    history = HistoricalRecords()

class Rango(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Rango")
    cxh = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Costo por Hora Normal (S/.)")
    descripcion = models.TextField(blank=True, null=True)

    class Meta: 
        verbose_name = "Rango Laboral"
        verbose_name_plural = "Rangos Laborales"
        ordering = ['nombre']

    def __str__(self): 
        return self.nombre
    
    history = HistoricalRecords()

class Gremio(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    responsable = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0.00), MaxValueValidator(100.00)], blank=True, null=True)
    incluir_en_cuota = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Gremio"
        verbose_name_plural = "Gremios"
        ordering = ['nombre']

    def __str__(self): return self.nombre

    history = HistoricalRecords()

class PCampo(models.Model):
    personal = models.OneToOneField(Personal, on_delete=models.CASCADE, related_name='obrero_info')
    rango = models.ForeignKey(Rango, on_delete=models.PROTECT, related_name="obreros_rango")
    gremio = models.ForeignKey(Gremio, on_delete=models.PROTECT, related_name="obreros_gremio")
    ESPECIALIDAD_CHOICES = [
        ('CAR', 'Carpintería'), ('FIE', 'Fierrería'), ('ALB', 'Albañilería'),
        ('ELE', 'Electricidad'), ('SAN', 'Sanitario/Gasfitería'), ('PIN', 'Pintura'),
        ('OPM', 'Operador Maquinaria'), ('AYU', 'Ayudante General'), ('TOP', 'Topografía'),
        ('GEN', 'General/Peón'), ('VIG', 'Vigía'), ('SOL', 'Soldador'),
        ('MEC', 'Mecánico'), ('CHO', 'Chófer/Conductor'),
        ('OTR', 'Otro'),
    ]
    especialidad = models.CharField(max_length=3, choices=ESPECIALIDAD_CHOICES, blank=True, null=True)

    retcc_img = models.ImageField(upload_to='retcc/', blank=True, null=True, verbose_name="Imagen Carnet RETCC")
    ESTADO_RETCC_CHOICES = [('Vigente', 'Vigente'), ('Vencido', 'Vencido'), ('No tiene', 'No tiene'), ('En Tramite', 'En Trámite')]
    retcc_estado = models.CharField(max_length=20, choices=ESTADO_RETCC_CHOICES, default= 'No tiene')
    srecomendado = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='recomendados_staff', verbose_name='Personal recomendado por Staff')
    ruc = models.CharField(max_length=11, null=True, blank=True, verbose_name="RUC Obrero")
    c_sol = models.CharField(max_length=50, null=True, blank=True, verbose_name="Clave SOL Obrero")
    sdni_img_hijo = models.ImageField(upload_to='SHdni/', blank=True, null=True, verbose_name="DNI del hijo")
    fecha_asignacion = models.DateField(default=timezone.now, verbose_name="Fecha de Asignación a Campo")
    activo_en_campo = models.BooleanField(default=True, verbose_name="Actualmente Activo en Campo")

    def __str__(self):
        gremio_nombre = self.gremio.nombre if self.gremio else "Sin gremio"
        return f"{self.personal.nombre} {self.personal.a_paterno} ({self.dni_personal()}) - Gremio: {gremio_nombre}"
    
    def dni_personal(self):
        return self.personal.dni
    dni_personal.short_description = "DNI"
    
    class Meta:
        verbose_name = "Personal de Campo"
        verbose_name_plural = "Personal de Campo"
        ordering = ['personal__a_paterno']

    history = HistoricalRecords()

#NEW MODELS

class HorarioTrabajo(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Horario")
    descripcion = models.TextField(blank=True, null=True)
    hs_dominical = models.DecimalField(max_digits=4, decimal_places=2, default=48.00, verbose_name="Horas semanales para dominical")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = "Horario de Trabajo"
        verbose_name_plural = "Horarios de Trabajo"
    history = HistoricalRecords()


class DetalleDiaHorario(models.Model):
    class DiaSemana(models.IntegerChoices):
        LUNES = 0, 'Lunes'
        MARTES = 1, 'Martes'
        MIERCOLES = 2, 'Miercoles'
        JUEVES = 3, 'Jueves'
        VIERNES = 4, 'Viernes'
        SABADO = 5, 'Sabado'
        DOMINGO = 6, 'Domingo'

    horario_trabajo = models.ForeignKey(HorarioTrabajo, on_delete=models.CASCADE, related_name='detalles_dias')
    dia_semana = models.IntegerField(choices=DiaSemana.choices, verbose_name="Dia de la semana")
    es_laborable = models.BooleanField(default=True)
    hora_entrada_teorica = models.TimeField(verbose_name="Hora Entrada Teorica")
    hora_inicio_tolerancia_entrada = models.TimeField(verbose_name="Inicio Tolerancia Entrada", blank=True, null=True)
    hora_fin_tolerancia_entrada = models.TimeField(verbose_name="Fin Tolerancia Entrada", blank=True, null=True)
    hora_inicio_descanso_teorica = models.TimeField(verbose_name="Inicio Descanso Teórico", blank=True, null=True)
    hora_fin_descanso_teorica = models.TimeField(verbose_name="Fin Descanso Teórico", blank=True, null=True)
    duracion_descanso_teorico = models.PositiveIntegerField(default=0, verbose_name="Duracion Descanso")
    hora_salida_teorica = models.TimeField(verbose_name="Hora Salida Teorica")
    horas_jornada_teorica = models.DecimalField(max_digits=4, decimal_places=2, verbose_name="Horas Jornada Teorica")

    def __str__(self):
        return f"{self.horario_trabajo.nombre} - {self.get_dia_semana_display()}"
    
    class Meta:
        unique_together = ('horario_trabajo', 'dia_semana')
        ordering = ['horario_trabajo', 'dia_semana']
        verbose_name = "Detalle Dia de Horario"
        verbose_name_plural = "Detalles Dias de Horarios"

    def clean(self):
        if self.hora_inicio_tolerancia_entrada and self.hora_fin_tolerancia_entrada and self.hora_fin_tolerancia_entrada < self.hora_inicio_tolerancia_entrada:
            raise models.ValidationError("La hora fin de tolerancia no puede ser anterior a la hora de inicio")
        
    history = HistoricalRecords()
        
class AsignacionHorario(models.Model):
    personal = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='asignaciones_horario')
    horario_trabajo = models.ForeignKey(HorarioTrabajo, on_delete=models.PROTECT, related_name='personal_asignado')
    fecha_inicio = models.DateField(verbose_name="Fecha de Inicio de Asignacion")
    fecha_fin = models.DateField(verbose_name="Fecha de Fin de Asignacion", blank=True, null=True)
    activo = models.BooleanField(default=True, help_text="Indica si esta asignación de horario está actualmente vigente.")

    def __str__(self):
        return f"{self.personal} asignado a {self.horario_trabajo.nombre} desde {self.fecha_inicio}"
    
    class Meta:
        ordering = ['-fecha_inicio', 'personal']
        verbose_name = "Asignacion de Horario"
        verbose_name_plural = "Asignaciones de Horarios"

    history = HistoricalRecords()

class Marcacion(models.Model):
    class Tipo(models.TextChoices):
        ENTRADA = 'ENTRADA', 'Entrada'
        INICIO_DESCANSO = 'INICIO_DESCANSO', 'Inicio Descanso'
        FIN_DESCANSO = 'FIN_DESCANSO', 'Fin Descanso'
        SALIDA = 'SALIDA', 'Salida'

    class Metodo(models.TextChoices):
        MANUAL_WEB = 'MANUAL_WEB', 'Manual (Sistema Web)'
        MANUAL_SUPERVISOR = 'MANUAL_SUPERVISOR', 'Manual (Supervisor)'
        BIOMETRICO_FACIAL = 'BIOMETRICO_FACIAL', 'Biométrico Facial'
        BIOMETRICO_HUELLA = 'BIOMETRICO_HUELLA', 'Biométrico Huella'
        TARJETA_RFID = 'TARJETA_RFID', 'Tarjeta RFID/NFC'
        APP_MOVIL = 'APP_MOVIL', 'App Móvil'
        SISTEMA = 'SISTEMA', 'Sistema (Automático)'

    personal = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='marcaciones')
    fecha_hora_marcada = models.DateTimeField(verbose_name="Fecha y Hora de la Marcacion Original")
    fecha_hora_efectiva = models.DateTimeField(verbose_name="Fecha y Hora Efectiva (puede ser corregida)")
    tipo_marcacion = models.CharField(max_length=20, choices=Tipo.choices)
    metodo_marcacion = models.CharField(max_length=25, choices=Metodo.choices)
    origen_marcacion = models.CharField(max_length=100, blank=True, null=True, verbose_name="Origen/Dispositivo")
    foto_evidencia = models.ImageField(upload_to='asistencia/evidencias/%Y/%m/%d/', blank=True, null=True)

    latitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marcaciones_creadas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    editado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marcaciones_editadas')
    fecha_edicion = models.DateTimeField(null=True, blank=True)
    motivo_edicion = models.TextField(blank=True, null=True)
    es_correccion_manual = models.BooleanField(default=False, help_text="Indica si esta marcación fue ajustada manualmente.")

    def save(self, *args, **kwargs):
        if not self.pk and not self.fecha_hora_efectiva:
            self.fecha_hora_efectiva = self.fecha_hora_marcada
        if self.pk and self.es_correccion_manual and not self.fecha_edicion:
            self.fecha_edicion = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.personal} - {self.get_tipo_marcacion_display()} - {self.fecha_hora_efectiva.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['personal', 'fecha_hora_efectiva']
        verbose_name = "Marcacion de Asistencia"
        verbose_name_plural = "Marcaciones de Asistencia"

    history = HistoricalRecords()

    
class JornadaLaboral(models.Model):
    class EstadoMarcaciones(models.TextChoices):
        COMPLETA = 'COMPLETA', 'Completa'
        PENDIENTE_ENTRADA = 'PENDIENTE_ENTRADA', 'Pendiente Entrada'
        PENDIENTE_SALIDA = 'PENDIENTE_SALIDA', 'Pendiente Salida'
        DESCANSO_INCOMPLETO = 'DESCANSO_INCOMPLETO', 'Descanso Incompleto'
        REQUIERE_REVISION = 'REQUIERE_REVISION', 'Requiere Revisión Manual'

    class EstadoJornada(models.TextChoices):
        PROGRAMADA = 'PROGRAMADA', 'Programada'
        EN_CURSO = 'EN_CURSO', 'En Curso'
        PRESENTE_COMPLETA = 'PRESENTE_COMPLETA', 'Presente (Completa)'
        PRESENTE_INCOMPLETA = 'PRESENTE_INCOMPLETA', 'Presente (Marc. Incompleta)'
        TARDANZA = 'TARDANZA', 'Tardanza'
        CON_HE_PENDIENTE = 'CON_HE_PENDIENTE', 'Con Horas Extra Pendientes'
        CON_HE_APROBADA = 'CON_HE_APROBADA', 'Con Horas Extra Aprobadas'
        AUSENTE_NJ = 'AUSENTE_NJ', 'Ausente (No Justificado)'
        AUSENTE_J = 'AUSENTE_J', 'Ausente (Justificado)'
        FALTA_REGISTRADA = 'FALTA_REGISTRADA', 'Falta Registrada'
        PERMISO_CG = 'PERMISO_CG', 'Permiso (Con Goce)'
        PERMISO_SG = 'PERMISO_SG', 'Permiso (Sin Goce)'
        VACACIONES = 'VACACIONES', 'Vacaciones'
        FERIADO_LABORADO = 'FERIADO_LABORADO', 'Feriado Laborado'
        FERIADO_NO_LABORADO = 'FERIADO_NO_LABORADO', 'Feriado No Laborado'
        SUSPENSION = 'SUSPENSION', 'Suspensión'

    personal = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='jornadas_laborales')
    fecha = models.DateField()
    detalle_dia_horario_aplicado = models.ForeignKey(DetalleDiaHorario, on_delete=models.PROTECT, related_name='jornadas_aplicadas')
    marcacion_entrada = models.OneToOneField(Marcacion, on_delete=models.SET_NULL, related_name='jornada_como_entrada', null=True, blank=True)

    marcacion_inicio_descanso = models.OneToOneField(Marcacion, on_delete=models.SET_NULL, related_name='jornada_como_inicio_descanso', null=True, blank=True)
    marcacion_fin_descanso = models.OneToOneField(Marcacion, on_delete=models.SET_NULL, related_name='jornada_como_fin_descanso', null=True, blank=True)
    marcacion_salida = models.OneToOneField(Marcacion, on_delete=models.SET_NULL, related_name='jornada_como_salida', null=True, blank=True)
    
    minutos_tardanza_calculados = models.PositiveIntegerField(default=0)
    horas_normales_calculadas = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    horas_extra_potenciales = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    horas_extra_aprobadas = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    estado_marcaciones = models.CharField(max_length=30, choices=EstadoMarcaciones.choices, default=EstadoMarcaciones.PENDIENTE_ENTRADA)
    estado_jornada = models.CharField(max_length=30, choices=EstadoJornada.choices, default=EstadoJornada.PROGRAMADA)
    aplica_dominical_calculado = models.BooleanField(default=False, help_text="Se determina el cierre semanal si cumplio horas.")
    observaciones_supervisor = models.TextField(blank=True, null=True)
    es_cerrada = models.BooleanField(default=False, help_text="Indica si la jornada pertenece a una semana ya cerrada.")

    def __str__(self):
        return f"Jornada de {self.personal} - {self.fecha.strftime('%Y-%m-%d')}"
    
    class Meta:
        unique_together = ('personal', 'fecha')
        ordering = ['-fecha', 'personal']
        verbose_name = "Jornada Laboral"
        verbose_name_plural = "Jornadas Laborales"

    history = HistoricalRecords()


class Incidencia(models.Model):
    class Tipo(models.TextChoices):
        HORA_EXTRA = 'HORA_EXTRA', 'Solicitud/Aprobación Hora Extra'
        TARDANZA_JUSTIFICADA = 'TARDANZA_JUSTIFICADA', 'Justificación Tardanza'
        AUSENCIA_JUSTIFICADA = 'AUSENCIA_JUSTIFICADA', 'Justificación Ausencia'
        PERMISO_CON_GOCE = 'PERMISO_CG', 'Permiso con Goce de Sueldo'
        PERMISO_SIN_GOCE = 'PERMISO_SG', 'Permiso sin Goce de Sueldo'
        AJUSTE_MARCACION = 'AJUSTE_MARCACION', 'Corrección/Ajuste de Marcación'
        MEMORANDO = 'MEMORANDO', 'Memorando/Llamada de Atención'
        OTRO = 'OTRO', 'Otro Tipo de Incidencia'

    class EstadoAprobacion(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente de Revisión'
        APROBADA = 'APROBADA', 'Aprobada'
        RECHAZADA = 'RECHAZADA', 'Rechazada'
        EN_PROCESO = 'EN_PROCESO', 'En Proceso'
        CERRADA = 'CERRADA', 'Cerrada/Resuelta'

    jornada_laboral = models.ForeignKey(JornadaLaboral, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidencias')
    personal = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='incidencias_personales')
    fecha_incidencia = models.DateField(verbose_name="Fecha de la Incidencia")
    tipo_incidencia = models.CharField(max_length=30, choices=Tipo.choices)
    descripcion_solicitud = models.TextField(verbose_name="Descripcion/Motivo de la Solicitud")
    documento_adjunto = models.FileField(upload_to='asistencia/incidencias_adjuntos/%Y/%m/', blank=True, null=True)
    
    fh_inicio_he = models.DateTimeField(null=True, blank=True, verbose_name='Inicio Hora Extra')
    fh_fin_he = models.DateTimeField(null=True, blank=True, verbose_name="Fin Hora Extra")
    hs_o_afectadas = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Horas Solicitadas/Afectadas")

    estado_aprobacion = models.CharField(max_length=20, choices=EstadoAprobacion.choices, default=EstadoAprobacion.PENDIENTE)
    ap_re_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidencias_gestionadas')
    fecha_ap_re = models.DateTimeField(null=True, blank=True)
    comentarios_aprobacion = models.TextField(blank=True, null=True)

    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidencias_creadas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_tipo_incidencia_display()} para {self.personal} en {self.fecha_incidencia}"
    
    class Meta:
        ordering = ['-fecha_incidencia', '-fecha_creacion']
        verbose_name = "Incidencia de Asistencia"
        verbose_name_plural = "Incidencias de Asistencia"

    history = HistoricalRecords()

class CalendarioFeriado(models.Model):
    class TipoFeriado(models.TextChoices):
        NACIONAL = 'NACIONAL', 'Nacional'
        REGIONAL = 'REGIONAL', 'Regional'
        LOCAL = 'LOCAL', 'Local/Provincial'
        EMPRESA = 'EMPRESA', 'Específico de Empresa'

    fecha = models.DateField(unique=True)
    descripcion = models.CharField(max_length=255)
    tipo = models.CharField(max_length=15, choices=TipoFeriado.choices, default=TipoFeriado.NACIONAL)
    pais = models.ForeignKey(Pais, on_delete=models.CASCADE, null=True, blank=True, help_text="Pais si el feriado es nacional o base para regional/local")
    region = models.ForeignKey(Region, on_delete=models.CASCADE, null=True, blank=True, help_text="Region si el feriado es regional")

    def __str__(self):
        return f"{self.fecha.strftime('%Y-%m-%d')} - {self.descripcion} ({self.get_tipo_display()})"
    
    class Meta:
        ordering = ['fecha']
        verbose_name = "Feriado"
        verbose_name_plural = "Feriados"

    history = HistoricalRecords()


class SemanaLaboralCierre(models.Model):
    ano = models.PositiveBigIntegerField()
    numero_semana_iso = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(53)], verbose_name="Numero de semana ISO")
    fecha_inicio_semana = models.DateField()
    fecha_fin_semana = models.DateField()
    es_cerrada = models.BooleanField(default=False, verbose_name="Semana Cerrada para Edicion")
    cerrada_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='semanas_cerradas')
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        estado = "Cerrada" if self.es_cerrada else "Abierta"
        return f"Semana {self.numero_semana_iso} del {self.ano} ({self.fecha_inicio_semana} al {self.fecha_fin_semana}) | {estado}"
    
    class Meta:
        unique_together = ('ano', 'numero_semana_iso')
        ordering = ['-ano', '-numero_semana_iso']
        verbose_name = "Cierre de Semana Laboral"
        verbose_name_plural = "Cierres de Semanas Laborales"

    history = HistoricalRecords()
        