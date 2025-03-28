from django import forms
from .models import Material, CategoriaMaterial

class CrearNuevaCategoriaForm(forms.Form):
    nombre = forms.CharField(label="Nombre", max_length=150, widget=forms.TextInput(attrs={'class': 'form-control'}))

class ActualizarCategoria(forms.ModelForm):
    class Meta:
        model = CategoriaMaterial
        fields = ['nombre']

class CrearNuevoMaterialForm(forms.Form):
    codigo = forms.CharField(label="Codigo", max_length=10, widget=forms.TextInput(attrs={'class': 'form-control'}))
    nombre = forms.CharField(label="Nombre", max_length=150, widget=forms.TextInput(attrs={'class': 'form-control'}))
    categoria = forms.ModelChoiceField(queryset=CategoriaMaterial.objects.all(), label="Categoria", widget=forms.Select(attrs={'class': 'form-control'}))
    umedida = forms.CharField(label="Unidad de Medida", max_length=10, widget=forms.TextInput(attrs={'class': 'form-control'}))
    cantidad = forms.DecimalField(label="Cantidad", widget=forms.NumberInput(attrs={'class': 'form-control', 'step':'0.01'}))

