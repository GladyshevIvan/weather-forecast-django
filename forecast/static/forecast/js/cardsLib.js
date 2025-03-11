//Класс, описывающий прогнозную карточку на день
export class Card {
    constructor(pic, alt, city, status, temperature, precipitation, wind,  date) {
        this.pic = pic;
        this.alt = alt;
        this.city = city;
        this.status = status;
        this.temperature = temperature;
        this.precipitation = precipitation;
        this.wind = wind;
        this.date = date;
    }

    //Создание шаблона карточки cardPattern, который будет отображаться на странице и заполнение заполнение его атрибутами
    fillCardPattern = () => {
        this.cardPattern = `<div class="cardDaysWeather">
			<div class="dayVisualDescribe">
                <img class="weatherPic universalWeatherPic" src="${this.pic}" alt="${this.alt}"/>
                <span class="cityName">${this.city}</span>
            </div>
            <div class="dayBio universalDayBio">
                <div class='majorRowDayBio'>
                    <span class="weatherStatus">${this.status}</span>
                    <span class="weatherTemperature">${this.temperature}°C</span>
                </div>
                <div class='minorRowDayBio'>
                    <div class="weatherPrecipitation">
                        <img class="minorPic universalWeatherPic" src="static/forecast/img/raindrops.svg" alt="Raindrops pic"/>
                        <span>${this.precipitation} mm</span>
                    </div>
                    <div class="weatherWind">
                        <img class="minorPic universalWeatherPic" src="static/forecast/img/wind.svg" alt="Wind pic"/>
                        <span>${this.wind} m/s</span>
                    </div>
                </div>
            </div>
		</div>
        <span class='weatherDay'>${this.date}</span>
        `
    }

    //Создание элемента для DOM-дерева, чьим содержимым будет cardPattern
    createElement = () => {
        this.element = document.createElement('div');
    }

    //Присваивание класса элементу
    assetClassName = () => {
        this.element.classList.add('cardDaysWeatherWrapper');
    }

    //Вставка cardPattern внутрь элемента
    fillElementWithData = () => {
        this.element.innerHTML = this.cardPattern;
    }

    //Добавление карточки в конец элемента contentCardsNode из DOM-дерева
    addCardToDom(contentCardsNode) {
        this.createElement();
        this.assetClassName();
        this.fillCardPattern();
        this.fillElementWithData();
        contentCardsNode.appendChild(this.element);
    }
}