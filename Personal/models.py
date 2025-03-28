from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Usuarios(models.Model):
    nombre = models.CharField(max_length=100)
    a_paterno = models.CharField(max_length=100)
    a_materno = models.CharField(max_length=100)
    dni = models.CharField(max_length=8)
    dni_img = models.ImageField(upload_to='dni/', blank=True, null=True)
    f_nacimiento = models.DateField()
    f_ingreso = models.DateField()
    edad = models.CharField(max_length=2)
    email = models.CharField(max_length=100)
    pais = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)
    distrito = models.CharField(max_length=100)
    cuenta_corriente = models.CharField(max_length=18)
    cci = models.CharField(max_length=20)
    tipo_usuario = models.CharField(
        max_length=20,
        choices=[('Staff', 'Staff'), ('PCampo', 'PCampo')]
    )
    t_zapato = models.CharField(max_length=2)
    t_polo = models.CharField(max_length=2)
    t_pantalon = models.CharField(max_length=2)
    celular = models.CharField(max_length=9)
    nro_emergencia = models.CharField(max_length=9)
    direccion = models.CharField(max_length=100)
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
    loguear = models.BooleanField(default=False)

class Staff(models.Model):
    usuario = models.OneToOneField(Usuarios, on_delete=models.CASCADE, related_name='staff_info')
    cargo = models.CharField(max_length=100)
    rm = models.DecimalField(max_digits=10, decimal_places=2)

class Rango(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    cxh = models.DecimalField(max_digits=10, decimal_places=2)

class PCampo(models.Model):
    usuario = models.OneToOneField(Usuarios, on_delete=models.CASCADE, related_name='obrero_info')
    rango = models.ForeignKey(Rango, on_delete=models.SET_NULL, null=True, blank=True)
    gremio = models.CharField(
        max_length=20,
        choices=[('Sindicato', 'Sindicato'), ('Subcontrato', 'Subcontrato'), ('Casa', 'Casa')]
    )
    retcc_img = models.ImageField(upload_to='retcc/', blank=True, null=True)
    retcc_estado = models.CharField(
        max_length=20,
        choices=[('Vigente', 'Vigente'), ('Vencido', 'Vencido'), ('No tiene', 'No tiene')]
    )

class Pcasa(models.Model):
    pcampo = models.OneToOneField(PCampo, on_delete=models.CASCADE, related_name='casa_data')
    srecomendado = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True)
    ruc = models.CharField(max_length=10)
    c_sol = models.CharField(max_length=30)


class Subcontrato(models.Model):
    nsubcontrato = models.CharField(max_length=100)
    rsubcontrato = models.CharField(max_length=100)

class Psubcontrato(models.Model):
    pcampo = models.OneToOneField(PCampo, on_delete=models.CASCADE, related_name='subcontrato_data')
    subcontrato = models.ForeignKey(Subcontrato, on_delete=models.SET_NULL, null=True, blank=True)


class Sindicato(models.Model):
    nsindicato = models.CharField(max_length=100)
    rsindicato = models.CharField(max_length=100)
    porcentaje = models.DecimalField(max_digits=10, decimal_places=2)


class Psindicato(models.Model):
    pcampo = models.OneToOneField(PCampo, on_delete=models.CASCADE, related_name='sindicato_data')
    sindicato = models.ForeignKey(Sindicato, on_delete=models.SET_NULL, null=True, blank=True)
    dni_hsindicato_img = models.ImageField(upload_to='hsindicato/', blank=True, null=True)
