from django.urls import path
from . import views

urlpatterns = [
    path('slots', views.get_slots, name='get_slots'),
    path('book', views.book_slot, name='book_slot'),
    path('admin/login', views.admin_login, name='admin_login'),
    path('admin/logs', views.get_logs, name='get_logs'),
    path('admin/mark-occupied', views.mark_occupied, name='mark_occupied'),
    path('admin/generate-invoice', views.generate_invoice, name='generate_invoice'),
    path('admin/reset-slot', views.reset_slot, name='reset_slot'),
]
