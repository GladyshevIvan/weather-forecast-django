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

//Выведение погоды для города, введённого в форму #cityTitle после нажатия кнопки #getForecastButton
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.querySelector('#getForecastButton');

    submitButton.addEventListener('click', async (event) => {
        const cityField = document.querySelector('#cityTitle');
        const rawCityName = cityField.value;
        event.preventDefault(); //Страница не перезагружается, прогноз погоды меняется динамически

        //Проверка, заполнино ли поле в форме
        if (rawCityName) {
            //Обработка на случай, если город не существует
            try {
                //Запрос к API в Django, который вернёт JSON - прогноз на неделю
                
                const response = await fetch('/api/get_form_forecast/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        rawCityName: rawCityName //Отправка названия города
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const rawData = await response.json(); //Получаем JSON

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
                console.error("Error:", error);
                alert("Sorry, we can't find a city with this name");
            }
        } else {
            alert('Enter city name');
        }
    });
});