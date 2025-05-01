import requests
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from Personal.models import Pais, Region, Provincia, Distrito

GEONAMES_USERNAME = "urzzard"
GEONAMES_BASE_URL = "http://api.geonames.org"


def get_geonames_data(endpoint, params):
    all_params = {'username': GEONAMES_USERNAME, **params}

    try:
        response = requests.get(f"{GEONAMES_BASE_URL}/{endpoint}", params=all_params, timeout=30)
        response.raise_for_status()
        data = response.json()

        if 'geonames' in data and isinstance(data['geonames'], list):
            return data['geonames']
        
        elif 'status' in data:
            print(f" -> API Error GeoNames ({endpoint}): {data['status']['message']} (Value: {data['status'].get('value')})")
            return []
        
        else:
            print(f" -> Respuesta inesperada de GeoNames ({endpoint}): {data}")
            return []
        
    except requests.exceptions.RequestException as e:
        print(f" -> Error de red o HTTP llamando a GeoNames ({endpoint}): {e}")
        return []
    except Exception as e:
        print(f" -> Error inesperado procesando respuesta de GeoNames ({endpoint}): {e}")
        return []
    
class Command(BaseCommand):
    help = 'Carga o actualiza datos geograficos desde GeoNames API para paises especificos.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--paises',
            nargs='+',
            type=str,
            help='Codigo ISO de 2 letras de los paises a cargar/actualizar (ej: PE CO EC).',
            required=True
        )

    @transaction.atomic
    def handle(self, *args, **options):
        codigos_pais = options['paises']
        self.stdout.write(f"Iniciando carga/actualizacion para paises: {', '.join(codigos_pais)}")
        self.stdout.write("Obteniendo informacion de paises desde GeoNames...")
        all_countries_data = get_geonames_data("countryInfoJSON", {})

        if not all_countries_data:
            raise CommandError("No se pudo obtener la lista de paises de GeoNames. Abortando.")
        
        countries_to_process = []
        for country_data in all_countries_data:
            if country_data.get('countryCode') in codigos_pais:
                countries_to_process.append(country_data)

        if not countries_to_process:
            self.stdout.write(self.style.WARNING("No se encontraron paises con los codigos proporcionados en GeoNames."))
            return
        
        for country_data in countries_to_process:
            geoname_id = country_data.get('geonameId')
            codigo = country_data.get('countryCode')
            nombre = country_data.get('countryName')
            divisa = country_data.get('currencyCode')

            if not all([geoname_id, codigo, nombre, divisa]):
                self.stdout.write(self.style.WARNING(f"Datos incompletos para pais {codigo}. Saltando."))
                continue

            self.stdout.write(f"\nProcesando Pais: {nombre} ({codigo})")

            pais_obj, created = Pais.objects.update_or_create(
                geoname_id=geoname_id,
                defaults={'codigo': codigo, 'nombre': nombre, 'divisa': divisa}
            )

            action = "Creado" if created else "Actualizado"
            self.stdout.write(self.style.SUCCESS(f" -> {action} Pais: {pais_obj.nombre}"))

            self.stdout.write(f" Obteniendo Regiones/Departamentos para {nombre}...")
            regiones_data = get_geonames_data("childrenJSON", {'geonameId': pais_obj.geoname_id, 'featureCode': 'ADM1'})

            if not regiones_data:
                self.stdout.write(self.style.WARNING(f"  No se encontraron regiones para {nombre}."))
                continue

            for region_data in regiones_data:
                region_geoname_id = region_data.get('geonameId')
                region_nombre = region_data.get('toponymName') or region_data.get('name')

                if not all([region_geoname_id, region_nombre]):
                    self.stdout.write(self.style.WARNING(f"  Datos incompletos para region. GeoNameID: {region_geoname_id}. Saltando"))
                    continue

                region_obj, created = Region.objects.update_or_create(
                    geoname_id=region_geoname_id,
                    defaults={'pais': pais_obj, 'nombre': region_nombre}
                )

                action = "Creado" if created else "Actualizado"
                self.stdout.write(f"  ->{action} Region: {region_obj.nombre}")

                #SI NO FUNCIONA CAMBIAR
                self.stdout.write(f"    Obteniendo Provincias para {region_nombre}...")
                provincias_data = get_geonames_data("childrenJSON", {'geonameId': region_obj.geoname_id})
                #

                if not provincias_data:
                    self.stdout.write(self.style.WARNING(f"   No se encontraron provincias para {region_nombre}."))
                    continue

                for prov_data in provincias_data:
                    prov_geoname_id = prov_data.get('geonameId')
                    prov_nombre = prov_data.get('toponymName') or prov_data.get('name')

                    if not all([prov_geoname_id, prov_nombre]):
                        self.stdout.write(self.style.WARNING(f"    Datos incompletos para provincia. GeoNameID: {prov_geoname_id}. Saltando."))
                        continue

                    prov_obj, created = Provincia.objects.update_or_create(
                        geoname_id=prov_geoname_id,
                        defaults={'region': region_obj, 'nombre': prov_nombre}
                    )
                    action = "Creado" if created else "Actualizado"
                    self.stdout.write(f"  ->{action} Provincia: {prov_obj.nombre}")

                    self.stdout.write(f"    Obteniendo Distritos para {prov_nombre}")
                    distritos_data = get_geonames_data("childrenJSON", {'geonameId': prov_obj.geoname_id})

                    if not distritos_data:
                        self.stdout.write(self.style.WARNING(f"     No se encontraron distritos para {prov_nombre}."))
                        continue

                    for dist_data in distritos_data:
                        dist_geoname_id = dist_data.get('geonameId')
                        dist_nombre = dist_data.get('toponymName') or dist_data.get('name')

                        if not all([dist_geoname_id, dist_nombre]):
                            self.stdout.write(self.style.WARNING(f"     Datos incompletos para distrito. GeoNameID: {dist_geoname_id}. Saltando."))
                            continue

                        dist_obj, created = Distrito.objects.update_or_create(
                            geoname_id=dist_geoname_id,
                            defaults={'provincia': prov_obj, 'nombre': dist_nombre}
                        )
                        action = "Creado" if created else "Actualizado"

                    self.stdout.write(f"     -> Procesados {len(distritos_data)} distritos para {prov_obj.nombre}.")
        self.stdout.write(self.style.SUCCESS("\n¡Proceso de carga/actualizacion completado!"))