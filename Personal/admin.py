from django.contrib import admin
from .models import (Personal, Staff, Rango, Gremio, PCampo, Pais, Region, Provincia, Distrito, HorarioTrabajo, DetalleDiaHorario, AsignacionHorario, Marcacion, JornadaLaboral, Incidencia, CalendarioFeriado, SemanaLaboralCierre)

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
#admin.site.register(HorarioTrabajo)
admin.site.register(AsignacionHorario)
#admin.site.register(Marcacion)
#admin.site.register(JornadaLaboral)
admin.site.register(Incidencia)
admin.site.register(CalendarioFeriado)
admin.site.register(SemanaLaboralCierre)

class DetalleDiaHorarioInline(admin.TabularInline):
    model = DetalleDiaHorario
    extra = 1
    fields = ('dia_semana', 'es_laborable', 'hora_entrada_teorica', 'hora_inicio_tolerancia_entrada', 'hora_fin_tolerancia_entrada',
              'hora_inicio_descanso_teorica', 'hora_fin_descanso_teorica', 'duracion_descanso_teorico', 'hora_salida_teorica', 'horas_jornada_teorica')
    ordering = ('dia_semana',)

if admin.site.is_registered(HorarioTrabajo):
    admin.site.unregister(HorarioTrabajo)
    
@admin.register(HorarioTrabajo)
class HorarioTrabajoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'hs_dominical', 'activo')
    inlines = [DetalleDiaHorarioInline]
    search_fields = ('nombre',)

if admin.site.is_registered(JornadaLaboral):
    admin.site.unregister(JornadaLaboral)

@admin.register(JornadaLaboral)
class JornadaLaboralAdmin(admin.ModelAdmin):
    list_display = ('personal', 'fecha', 'estado_marcaciones', 'estado_jornada', 'horas_normales_calculadas', 'horas_extra_aprobadas', 'es_cerrada')
    list_filter = ('fecha', 'estado_jornada', 'es_cerrada', 'personal__obrero_info__gremio')
    search_fields = ('personal__nombre', 'personal__a_paterno', 'personal__dni', 'fecha_isoformat')
    date_hierarchy = 'fecha'
    readonly_fields = ('marcacion_entrada', 'marcacion_inicio_descanso', 'marcacion_fin_descanso', 'marcacion_salida', 'minutos_tardanza_calculados', 'horas_normales_calculadas', 'horas_extra_potenciales')
    fieldsets = (
        (None, {
            'fields': ('personal', 'fecha', 'detalle_dia_horario_aplicado', 'es_cerrada')
        }),
        ('Marcaciones Asociadas (Solo Lectura)', {
            'fields': ('marcacion_entrada', 'marcacion_inicio_descanso', 'marcacion_fin_descanso', 'marcacion_salida'),
            'classes': ('collapse',),
        }),
        ('Cálculos y Estados', {
            'fields': ('minutos_tardanza_calculados', 'horas_normales_calculadas', 'horas_extra_potenciales', 'horas_extra_aprobadas',
                       'estado_marcaciones', 'estado_jornada', 'aplica_dominical_calculado')
        }),
        ('Observaciones', {
            'fields': ('observaciones_supervisor',)
        }),
    )

if admin.site.is_registered(Marcacion):
    admin.site.unregister(Marcacion)

@admin.register(Marcacion)
class MarcacionAdmin(admin.ModelAdmin):
    list_display = ('personal', 'fecha_hora_efectiva', 'tipo_marcacion', 'metodo_marcacion', 'es_correccion_manual', 'creado_por', 'editado_por')
    list_filter = ('tipo_marcacion', 'metodo_marcacion', 'fecha_hora_efectiva', 'es_correccion_manual')
    search_fields = ('personal__nombre', 'personal__a_paterno', 'personal__dni')
    readonly_fields = ('fecha_creacion', 'fecha_edicion')
    fieldsets = (
        (None, {
            'fields': ('personal', 'fecha_hora_marcada', 'fecha_hora_efectiva', 'tipo_marcacion', 'metodo_marcacion', 'origen_marcacion')
        }),
        ('Evidencia y Geolocalización (Opcional)', {
            'fields': ('foto_evidencia', 'latitud', 'longitud'),
            'classes': ('collapse',),
        }),
        ('Auditoría de Creación', {
            'fields': ('creado_por', 'fecha_creacion'),
        }),
        ('Auditoría de Edición (si aplica)', {
            'fields': ('es_correccion_manual', 'editado_por', 'fecha_edicion', 'motivo_edicion'),
            'classes': ('collapse',),
        }),
    )