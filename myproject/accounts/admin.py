from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import BranchMembership, User

# Register your models here.
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Thông tin vai trò', {'fields': ('role',)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Thông tin vai trò', {'fields': ('role',)}),
    )

    list_display = (
        'username',
        'email',
        'role',
        'is_staff',
        'is_active',
    )

@admin.register(BranchMembership)
class BranchMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'branch')
    list_filter = ('branch',)
    search_fields = ('user__username', 'branch__name')