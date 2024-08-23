from django.urls import include, path
from . import views

urlpatterns = [
    path('dump-code', views.assemble_code, name='assemble-code'),
    path('assemble-code', views.assemble_code, name='assemble-code'),
]