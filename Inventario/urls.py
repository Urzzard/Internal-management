from django.urls import path, include
from rest_framework import routers
from rest_framework.documentation import include_docs_urls
from .views import ImportMaterialView
from Inventario import views

router = routers.DefaultRouter()
router.register(r'Categoria', views.CategoriaView, 'categorias')
router.register(r'Material', views.MaterialView, 'materiales')

urlpatterns = [
    path("api-inventario/", include(router.urls)),
    path('docs/', include_docs_urls(title="Api Inventario")),
    path('api-inventario/import-materials/', ImportMaterialView.as_view(), name='import-materials')
]