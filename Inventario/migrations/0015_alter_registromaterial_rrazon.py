# Generated by Django 5.1.7 on 2025-04-01 16:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Inventario', '0014_alter_registromaterial_rrazon_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registromaterial',
            name='rrazon',
            field=models.CharField(choices=[('Uso', 'Uso'), ('Traslado', 'Traslado'), ('Compra', 'Compra')], max_length=20),
        ),
    ]
