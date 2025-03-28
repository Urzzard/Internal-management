from rest_framework import serializers
from .models import CategoriaMaterial, Material

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaMaterial
        #fields = ('id', 'nombre')
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'
