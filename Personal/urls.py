from django.urls import path, include
from rest_framework import routers
from rest_framework.documentation import include_docs_urls
from Personal import views

router = routers.DefaultRouter()
router.register(r'Personal', views.PersonalView, 'personal')
router.register(r'Staff', views.StaffView, 'staff')
router.register(r'Rango', views.RangoView, 'rango')
router.register(r'Gremio', views.GremioView, 'gremio')
router.register(r'PCampo', views.PCampoView, 'pcampo')
""" router.register(r'Pcasa', views.PcasaView, 'pcasa')
router.register(r'Psubcontrato', views.PsubcontratoView, 'psubcontrato')
router.register(r'Psindicato', views.PsindicatoView, 'psindicato') """
router.register(r'AdminCreateUser', views.AdminUserCreateView, 'admin-create-user')
router.register(r'AdminManageUsers', views.AdminUserManagementView, 'admin-manage-users')
router.register(r'Paises', views.PaisViewSet, 'paises')
router.register(r'Regiones', views.RegionViewSet, 'regiones')
router.register(r'Provincias', views.ProvinciaViewSet, 'provincias')
router.register(r'Distritos', views.DistritoViewSet, 'distritos')

urlpatterns = [
    path("api-personal/", include(router.urls)),
    path("api-personal/eligible-users/", views.EligibleUsersForStaffView.as_view(), name='eligible-users'),
    path("api-personal/eligible-personal/", views.EligiblePersonalForStaffView.as_view(), name='eligible-personal'),
    path('personal-docs/', include_docs_urls(title="Api Personal")),
]