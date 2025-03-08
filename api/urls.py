from django.urls import path
from . import get_forecast

app_name = 'api'

urlpatterns = [
    path('get_form_forecast/', get_forecast.get_form_forecast, name='get_form_forecast'),
    path('get_geolocation_forecast/', get_forecast.get_geolocation_forecast, name='get_geolocation_forecast')
]
