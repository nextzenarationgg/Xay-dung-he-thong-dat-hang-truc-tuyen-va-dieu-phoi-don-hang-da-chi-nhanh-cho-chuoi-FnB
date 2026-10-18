from django.db import models

# Create your models here.
class Branch(models.Model):
    name = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    