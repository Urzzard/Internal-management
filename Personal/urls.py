from django.urls import path, include
from rest_framework import routers
from rest_framework.documentation import include_docs_urls
from Personal import views

router = routers.DefaultRouter()
router.register(r'Usuarios', views.UsuariosView, 'usuarios')
router.register(r'Staff', views.StaffView, 'staff')
router.register(r'PCampo', views.PCampoView, 'pcampo')
router.register(r'Rango', views.RangoView, 'rango')
router.register(r'Pcasa', views.PcasaView, 'pcasa')
router.register(r'Psubcontrato', views.PsubcontratoView, 'psubcontrato')
router.register(r'Subcontrato', views.SubcontratoView, 'subcontrato')
router.register(r'Psindicato', views.PsindicatoView, 'psindicato')
router.register(r'Sindicato', views.SindicatoView, 'sindicato')

urlpatterns = [
    path("api-personal/", include(router.urls)),
    path('docs/', include_docs_urls(title="Api Personal"))
]