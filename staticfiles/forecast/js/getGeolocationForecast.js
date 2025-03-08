import {Card} from './cardsLib.js';
import {showForecast} from './showForecast.js';


//Получение CSRF-токена из cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


//Получение погоды по текущей геолокации
async function getWeatherData() {
    let latitude, longitude;

    //Координаты по умолчанию
    longitude = 37.6176;
    latitude = 55.7558;

    //Если геолокация включена, можно получить координаты, иначе останутся координаты по умолчанию
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

        } catch (error) {
            console.error("Impossible to find a geolocation", error);
        }
    } else {
        console.log("Geolocation don't support in your browser");
    }

    //Запрос к API в Django, который вернёт JSON - прогноз на неделю
    try {
        const response = await fetch('/api/get_geolocation_forecast/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                //Отправка координат
                latitude: latitude,
                longitude: longitude
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const rawData = await response.json();

        //Массив, в котором будут хранится семь объектов Card - прогноз на каждый день
        let previewDaysArray = [];

        for (let day of rawData.weeklyForecast) {
            let pic = day.pic
            let alt = day.alt
            let status = day.status
            let temperature = day.temperature
            let precipitation = day.precipitation
            let wind = day.wind
            let city = day.city
            let date = day.date
            previewDaysArray.push(new Card(pic, alt, status, temperature, precipitation, wind, city, date))
        }

        showForecast(previewDaysArray); //Отображение прогноза на странице

    } catch (error) {
        console.error('Error:', error);
    }
}

getWeatherData();