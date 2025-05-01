from django.contrib import admin
from .models import Personal, Staff, Rango, Gremio, PCampo, Pais, Region, Provincia, Distrito

# Register your models here.
admin.site.register(Personal)
admin.site.register(Staff)
admin.site.register(Rango)
admin.site.register(Gremio)
admin.site.register(PCampo)
admin.site.register(Pais)
admin.site.register(Region)
admin.site.register(Provincia)
admin.site.register(Distrito)