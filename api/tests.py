from django.test import TestCase
from django.urls import reverse
import asyncio
import json

class ForecastViewsTests(TestCase):
    def test_get_geolocation_forecast_success(self):
        '''Проверка на успешное получение прогноза по широте и долготе'''

        url = reverse('api:get_geolocation_forecast')
        data = {'latitude': 55.75, 'longitude': 37.62}  #Широта и долгота
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')

        #Проверка, что запрос выполнен успешно - код 200
        self.assertEqual(response.status_code, 200)

        #Проверка, что вернулся JSON
        self.assertEqual(response['content-type'], 'application/json')

        #Проверяка есть ли в JSON ключ weeklyForecast
        try:
            json_data = response.json()
            self.assertIn('weeklyForecast', json_data)
        except json.JSONDecodeError:
            self.fail("Response did not contain valid JSON")

    def test_get_geolocation_forecast_get_method(self):
        '''Проверка, что GET-запрос запрещен'''

        url = reverse('api:get_geolocation_forecast')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_get_geolocation_forecast_invalid_json(self):
        '''Проверка обработки некорректного JSON'''

        url = reverse('api:get_geolocation_forecast')
        data = {'latitude': 55.75}  #Отсутствует долгота
        response = self.client.post(url, data=data, content_type='application/json')
        self.assertEqual(response.status_code, 500)

    def test_get_geolocation_forecast_invalid_coordinates(self):
        '''Проверка обработки несуществующих координат'''

        url = reverse('api:get_geolocation_forecast')
        data = {'latitude': 91, 'longitude': 181}  #Несуществующие координаты
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 500)

    def test_get_form_forecast_success(self):
        '''Проверка на успешное получение прогноза по названию'''

        url = reverse('api:get_form_forecast')
        data = {'rawCityName': 'Moscow'}
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')

        #Проверка, что запрос выполнен успешно - код 200
        self.assertEqual(response.status_code, 200)

        #Проверка, что вернулся JSON
        self.assertEqual(response['content-type'], 'application/json')

        #Проверяка есть ли в JSON ключ weeklyForecast
        try:
            json_data = response.json()
            self.assertIn('weeklyForecast', json_data)
        except json.JSONDecodeError:
            self.fail("Response did not contain valid JSON")

    def test_get_form_forecast_get_method(self):
        '''Проверка, что GET-запрос запрещен'''

        url = reverse('api:get_form_forecast')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)  # Method Not Allowed

    def test_get_form_forecast_invalid_json(self):
        '''Проверка обработки некорректного JSON'''

        url = reverse('api:get_form_forecast')
        data = {} #Некорректный JSON
        response = self.client.post(url, data=data, content_type='application/json')
        self.assertEqual(response.status_code, 500)

    def test_get_form_forecast_empty_city_name(self):
        '''Проверяка на обработку ситуации, когда не указано название города'''

        url = reverse('api:get_form_forecast')
        data = {'rawCityName': ''}  #Название города не переданно
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 500)