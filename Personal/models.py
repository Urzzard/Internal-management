from django.db import models
from django.contrib.auth.models import User

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
    edad = models.CharField(max_length=2)
    email = models.EmailField(max_length=100, blank=True, null=True)

    pais = models.ForeignKey(Pais, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_pais')
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_region')
    provincia = models.ForeignKey(Provincia, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_provincia')
    distrito = models.ForeignKey(Distrito, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal_distrito')

    cuenta_corriente = models.CharField(max_length=18)
    cci = models.CharField(max_length=20)
    t_zapato = models.CharField(max_length=3)
    t_polo = models.CharField(max_length=3)
    t_pantalon = models.CharField(max_length=3)
    celular = models.CharField(max_length=15, blank=True, null=True)
    nro_emergencia = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    e_civil = models.CharField(
        max_length=20,
        choices=[('Solter@', 'Solter@'), ('Casad@', 'Casad@'), ('Divorciad@', 'Divorciad@'), ('Viud@', 'Viud@')]
    )
    sexo = models.CharField(
        max_length=20,
        choices=[('Masculino', 'Masculino'), ('Femenino', 'Femenino')]
    )
    estado = models.CharField(
        max_length=20,
        choices=[('Activo', 'Activo'), ('Inactivo', 'Inactivo'), ('Despedido', 'Despedido')]
    )

    def __str__(self):
        return f"{self.nombre} {self.a_paterno} ({self.dni})"

class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    personal = models.OneToOneField(Personal, on_delete=models.CASCADE, related_name='staff_info')
    cargo = models.CharField(max_length=200)
    rm = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.user.username} - {self.cargo}"

class Rango(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    cxh = models.DecimalField(max_digits=10, decimal_places=2)

class Gremio(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    responsable = models.CharField(max_length=100)
    porcentaje = models.DecimalField(max_digits=10, decimal_places=2)

class PCampo(models.Model):
    personal = models.OneToOneField(Personal, on_delete=models.CASCADE, related_name='obrero_info')
    rango = models.ForeignKey(Rango, on_delete=models.SET_NULL, null=True, blank=True)
    gremio = models.ForeignKey(Gremio, on_delete=models.SET_NULL, null=True, blank=True)
    retcc_img = models.ImageField(upload_to='retcc/', blank=True, null=True)
    retcc_estado = models.CharField(
        max_length=20,
        choices=[('Vigente', 'Vigente'), ('Vencido', 'Vencido'), ('No tiene', 'No tiene')],
        default= 'No tiene'
    )
    srecomendado = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='recomendados_staff', verbose_name='Personal recomendado por Staff')
    ruc = models.CharField(max_length=11, null=True, blank=True, verbose_name="RUC Obrero")
    c_sol = models.CharField(max_length=50, null=True, blank=True, verbose_name="Clave SOL Obrero")
    sdni_img_hijo = models.ImageField(upload_to='SHdni/', blank=True, null=True, verbose_name="DNI del hijo")

    def __str__(self):
        gremio_nombre = self.gremio.nombre if self.gremio else "Sin Gremio"
        return f"{self.personal.nombre} {self.personal.a_paterno} - {gremio_nombre}"

""" class Pcasa(models.Model):
    pcampo = models.OneToOneField(PCampo, on_delete=models.CASCADE, related_name='casa_data')
    srecomendado = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True)
    ruc = models.CharField(max_length=10)
    c_sol = models.CharField(max_length=30)


class Psubcontrato(models.Model):
    pcampo = models.OneToOneField(PCampo, on_delete=models.CASCADE, related_name='subcontrato_data')


class Psindicato(models.Model):
    pcampo = models.OneToOneField(PCampo, on_delete=models.CASCADE, related_name='sindicato_data')
    dni_img_hijo = models.ImageField(upload_to='SHdni/', blank=True, null=True) """

