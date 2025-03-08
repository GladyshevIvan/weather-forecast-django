from datetime import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import asyncio
import aiohttp
from asgiref.sync import async_to_sync
#Для того, чтобы статические файлы работали и с DEBUG=True, и с DEBUG=False
from django.contrib.staticfiles.storage import staticfiles_storage

def convert_weather_code_to_status(weather_code):
    '''Конвертация weatherCode в Погоду, картинку для этой погоды и её альтернативное описание'''

    if weather_code in [0]:
        return ['Sun', staticfiles_storage.url('forecast/img/sun.svg'), 'Sun pic']
    elif weather_code in [1]:
        return ['Сlear', staticfiles_storage.url('forecast/img/mainlyclear.svg'), 'Mainly clear pic']
    elif weather_code in [2]:
        return ['Cloudy', staticfiles_storage.url('forecast/img/cloudy.svg'), 'Clouds pic']
    elif weather_code in [3]:
        return ['Overcast', staticfiles_storage.url('forecast/img/overcast.svg'), 'Overcast pic']
    elif weather_code in [45, 48]:
        return ['Fog', staticfiles_storage.url('forecast/img/fog.svg'), 'Fog pic']
    elif weather_code in [71, 73, 75, 77, 85, 86]:
        return ['Snow', staticfiles_storage.url('forecast/img/snow.svg'), 'Snow pic']
    elif weather_code in [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]:
        return ['Rain', staticfiles_storage.url('forecast/img/rain.svg'), 'Rain pic']
    elif weather_code in [95, 96, 99]:
        return ['Thunder', staticfiles_storage.url('forecast/img/thunderstorm.svg'), 'Thunder pic']
    else:
        return None

def convert_str_to_date(raw_data):
    '''Форматирование строки с датой в формате %Y-%m-%d в строку формата: день месяц'''
    date_object = datetime.strptime(raw_data, "%Y-%m-%d")

    day = date_object.day
    month_name = date_object.strftime("%B")

    return f'{day} {month_name}'

async def get_city_name(lat, lon):
    '''Получение названия города по координатам'''

    apiUrl = f'https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1&accept-language=en'
    async with aiohttp.ClientSession() as session:
        async with session.get(apiUrl) as response:
            data = await response.json()
            try:
                city_name = data['address']['city']
            except KeyError:
                city_name = 'Moscow'
            return city_name


async def get_cords_and_name(raw_city_name):
    '''Получение координат и отформатированного названия города по введенному в форму названию городу'''

    apiUrl = f'https://nominatim.openstreetmap.org/search?q={raw_city_name}&format=json&limit=1&accept-language=en'
    async with aiohttp.ClientSession() as session:
        async with session.get(apiUrl) as response:
            data = await response.json()
            try:
                city_name = data[0]['name']
                latitude = data[0]['lat']
                longitude = data[0]['lon']
                return city_name, latitude, longitude
            except:
                raise ValueError(f"City '{raw_city_name}' did't find")


async def get_weekly_forecast_rawdata(lat, lon):
    '''Получение неотформатированных данных с погодой по координатам'''

    apiUrl = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weather_code,temperature_2m_max,sunrise,sunset,precipitation_sum,wind_speed_10m_max'
    async with aiohttp.ClientSession() as session:
        async with session.get(apiUrl) as response:
            data = await response.json()
            return data


def create_weekly_forecast(weather_data, city_name):
    '''Создание недельного прогноза погоды в виде JSON списка из словарей'''

    days_array = weather_data['daily']['time']
    days_weather_code = weather_data['daily']['weather_code']
    days_temperature = weather_data['daily']['temperature_2m_max']
    days_precipitation_sum = weather_data['daily']['precipitation_sum']
    days_wind_speed = weather_data['daily']['wind_speed_10m_max']

    preview_days_array = []
    for day in zip(days_array, days_weather_code, days_temperature, days_precipitation_sum, days_wind_speed):

        date = convert_str_to_date(day[0])
        weather_code = day[1]
        temperature = day[2]
        precipitation_sum = day[3]
        wind_speed = day[4]

        status, pic, alt = convert_weather_code_to_status(weather_code)
        preview_days_array.append({
            'pic': pic,
            'alt': alt,
            'city': city_name,
            'status': status,
            'temperature': temperature,
            'precipitation': precipitation_sum,
            'wind': wind_speed,
            'date': date
        })

    return preview_days_array


@csrf_exempt
@async_to_sync
async def get_form_forecast(request):
    '''Получение прогноза по поисковому запросу'''

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            raw_city_name = data['rawCityName']

            city_name_checked, latitude, longitude = await get_cords_and_name(raw_city_name)
            weather_data = await get_weekly_forecast_rawdata(latitude, longitude)
            forecast = create_weekly_forecast(weather_data, city_name_checked)
            return JsonResponse({'weeklyForecast': forecast})
        except:
            return JsonResponse({'error': 'An error occurred while fetching the weather'}, status=500)
    else:
        return JsonResponse({'error': 'Only POST-requests allowed'}, status=405)

@csrf_exempt
@async_to_sync
async def get_geolocation_forecast(request):
    '''Получение прогноза по геолокации пользователя'''
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            latitude = data['latitude']
            longitude = data['longitude']

            city_name = await get_city_name(latitude, longitude)
            weather_data = await get_weekly_forecast_rawdata(latitude, longitude)
            forecast = create_weekly_forecast(weather_data, city_name)
            return JsonResponse({'weeklyForecast': forecast})
        except Exception as err:
            return JsonResponse({'error': 'An error occurred while fetching the weather'}, status=500)
    else:
        return JsonResponse({'error': 'Only POST-requests allowed'}, status=405)
