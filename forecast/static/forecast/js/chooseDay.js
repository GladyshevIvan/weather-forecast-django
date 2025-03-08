//Отображение карточки внутри элемента. В начале у элмента стирается содержимое, затем добавляется карточка
export const showChosenCard = (field, card) => {
    field.innerHTML = '';
    field.innerHTML = card;
}

document.addEventListener('DOMContentLoaded', () =>{
    const previewField = document.querySelector('.previewDaysWeather');
    const chosenDayField = document.querySelector('.chosenDayWeather');

    //После клика по карточке дня недели, погода для него перемещается в область .chosenDayWeather
    previewField.addEventListener('click', (event)=> {
        const clickedCard = event.target.closest('.cardDaysWeather').outerHTML;
        showChosenCard(chosenDayField, clickedCard);
    })
})