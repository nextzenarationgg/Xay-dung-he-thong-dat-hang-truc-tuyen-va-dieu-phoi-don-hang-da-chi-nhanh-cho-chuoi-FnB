from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("branches", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="branch", name="latitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="branch", name="longitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="branch", name="phone",
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name="branch", name="max_capacity",
            field=models.PositiveSmallIntegerField(default=20),
        ),
        migrations.AddField(
            model_name="branch", name="is_accepting_orders",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="branch", name="rating",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=3),
        ),
        migrations.AddField(
            model_name="branch", name="rating_count",
            field=models.PositiveIntegerField(default=0),
        ),
    ]