from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date
from django.core.validators import MinValueValidator, MaxValueValidator

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

class Region(models.Model):
    geoname_id = models.IntegerField(unique=True, db_index=True, verbose_name="GeoName ID")
    pais = models.ForeignKey(Pais, on_delete=models.CASCADE, related_name='regiones')
    nombre = models.CharField(max_length=150, verbose_name="Nombre de ka Region/Departamento")

    class Meta:
        verbose_name = "Región/Departamento"
        verbose_name_plural = "Regiones/Departamentos"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.pais.codigo})"
    
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


class Personal(models.Model):
    nombre = models.CharField(max_length=100)
    a_paterno = models.CharField(max_length=100)
    a_materno = models.CharField(max_length=100)
    dni = models.CharField(max_length=8, unique=True)
    dni_img = models.ImageField(upload_to='dni/', blank=True, null=True)
    f_nacimiento = models.DateField()
    f_ingreso = models.DateField()
    email = models.EmailField(max_length=100, blank=True, null=True)

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

class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    personal = models.OneToOneField(Personal, on_delete=models.CASCADE, related_name='staff_info')
    cargo = models.CharField(max_length=200)
    rm = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Remuneración Mensual")

    class Meta:
        verbose_name = "Staff"
        verbose_name_plural = "Staff"

    def __str__(self):
        return f"{self.user.username} - {self.personal.a_materno} - {self.cargo}"

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
        return f"{self.personal.nombre} {self.gremio}"



