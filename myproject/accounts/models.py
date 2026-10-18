from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):

    ROLE_CHOICES = [
        ('customer', 'Khách hàng'),
        ('branch_staff', 'Nhân viên chi nhánh'),
        ('delivery', 'Nhân viên giao hàng'),
        ('branch_admin', 'Quản trị chi nhánh'),
        ('super_admin', 'Quản trị tổng'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='customer'
    )
    
    def __str__(self):
        return self.username

class BranchMembership(models.Model):

    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='branch_membership'
    )

    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.PROTECT,
        related_name='members'
    )

    def __str__(self):
        return f'{self.user.username} - {self.branch.name}'