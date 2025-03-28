from django.db import models
from django.contrib.auth.models import User


class CategoriaMaterial(models.Model):
    nombre = models.CharField(max_length=150)

class Material(models.Model):
    codigo = models.CharField(max_length=10)
    nombre = models.CharField(max_length=200)
    categoria = models.ForeignKey(CategoriaMaterial, on_delete=models.CASCADE)
    umedida = models.CharField(max_length=10)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)

"""     def __str__(self):
        return self.nombre + ' - ' + self.categoria.nombre """

class RegistroMaterial(models.Model):

    TIPO_REGISTROS = {
         ('Ingreso', 'Ingreso'),
         ('Salida', 'Salida'),
     }
    RAZON_REGISTROS = {
         ('Traslado', 'Traslado'),
         ('Compra', 'Compra'),
         ('Uso', 'Uso')
     }
    rtipo = models.CharField(max_length=10, choices=TIPO_REGISTROS)
    rcantidad = models.IntegerField()
    rproducto = models.ForeignKey(Material, on_delete=models.CASCADE)
    rrazon = models.CharField(max_length=20, choices=RAZON_REGISTROS)
    rusuario = models.ForeignKey(User, on_delete=models.CASCADE)
    rfecha = models.DateTimeField(auto_now_add=True)