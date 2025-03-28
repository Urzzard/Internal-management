from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import viewsets, status
from openpyxl import load_workbook
import pandas as pd
from .serializer import CategoriaSerializer, MaterialSerializer
from .models import Material, CategoriaMaterial


# Create your views here.

class CategoriaView(viewsets.ModelViewSet):
    serializer_class = CategoriaSerializer
    queryset = CategoriaMaterial.objects.all()

class MaterialView(viewsets.ModelViewSet):
    serializer_class = MaterialSerializer
    queryset = Material.objects.all()

class ImportMaterialView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        print(f"Headers: {request.headers}")
        print(f"Content-Type: {request.content_type}")
        print(f"FILES: {request.FILES}")

        if 'file' not in request.FILES:
            return Response({"error": "No hay archivo"}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        print(f"Received file: {file.name}")

        try:
            document = pd.read_excel(file)
            print(f"Excel content: {document.head()}")
        except Exception as e:
            print(f"Error al leer el archivo Excel: {str(e)}")
            return Response({"error": f"Error reading Excel file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        materials = []

        for _, row in document.iterrows():
            material_data = {
                'codigo': row['CODIGO'],
                'nombre': row['NOMBRE'],
                'categoria': row['CATEGORIA'],
                'umedida': row['UNIDAD DE MEDIDA'],
                'cantidad': row['CANTIDAD'],
            }
            print(f"Processing row: {material_data}")

            serializer = MaterialSerializer(data = material_data)
            if serializer.is_valid():
                materials.append(serializer.save())
            else:
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        return Response({"message": "Archivo importado con éxito", "imported_materials": len(materials)}, status=status.HTTP_200_OK)