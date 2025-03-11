import {Card} from './cardsLib.js';
import {getCookie} from './csrfDefence.js';
import {showForecast} from './showForecast.js';


//Выведение погоды для города, введённого в форму #cityTitle после нажатия кнопки #getForecastButton
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.querySelector('#getForecastButton');

    submitButton.addEventListener('click', async (event) => {
        const cityField = document.querySelector('#cityNameInput');
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
                        //Получение CSRF-токена из cookies, который подставляется в X-CSRFToken для проверки подлинности запроса
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
                    let city = day.city
                    let status = day.status
                    let temperature = day.temperature
                    let precipitation = day.precipitation
                    let wind = day.wind
                    let date = day.date

                    previewDaysArray.push(new Card(pic, alt, city, status, temperature, precipitation, wind,  date))
                }

                showForecast(previewDaysArray); //Отображение прогноза на странице

            } catch (error) {
                console.error("Error:", error);
                alert('An error occurred while fetching the weather');
            }
        } else {
            alert('Enter city name');
        }
    });
});