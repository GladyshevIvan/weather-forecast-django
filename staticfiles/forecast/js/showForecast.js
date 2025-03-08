//Отображение массива с недельным прогнозом, состоящим из объектов Card, на странице
export const showForecast = (weeklyForecast) => {
    const tomorrow = weeklyForecast[0]; //Прогноз на завтра

    const mainField = document.querySelector('.chosenDayWeather'); //Элемент, в котором будет отображаться прогноз на завтра (по умолчанию) или день по выбору пользователя
    const previewField = document.querySelector('.previewDaysWeather'); //Элемент, в котором будут отображаться прогноз на всю неделю

    //Очистка содержимого элементов перед тем, как поместить в них карточки прогноза
    mainField.innerHTML = '';
    previewField.innerHTML = '';

    tomorrow.addCardToDom(mainField); //Добавление прогноза на завтра в .chosenDayWeather

    //Добавление прогноза на неделю в .previewDaysWeather
    for (let i of weeklyForecast) {
        i.addCardToDom(previewField);
    }
}