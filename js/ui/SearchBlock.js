/**
 * Класс SearchBlock
 * Используется для взаимодействием со строкой ввода и поиска изображений
 * */
class SearchBlock {
  constructor(element) {
    this.element = element;
    this.registerEvents();
  }

  /**
   * Выполняет подписку на кнопки "Заменить" и "Добавить"
   * Клик по кнопкам выполняет запрос на получение изображений и отрисовывает их,
   * только клик по кнопке "Заменить" перед отрисовкой очищает все отрисованные ранее изображения
   */
  registerEvents() {

    function checkInput(input) {
      if (input.value === '') {
        return false;
      } else {
        return true;
      }
    };

    const input = document.querySelector('input');
    const btnReplace = document.querySelector('.replace');
    const btnAdd = document.querySelector('.add');

    // Клик по кнопке заменить
    btnReplace.addEventListener('click', (e) => {
      e.preventDefault();

      // Если input пустой - ничего не делать
      if (!checkInput(input)) {
        return
      };

      // очищаю ImageViewer
      App.imageViewer.clear();

      const inputValue = input.value;
      // Получаю и отрисовываю изображения
      VK.get(inputValue.trim(), App.imageViewer.drawImages);
    });

    // Клик по кнопке добавить
    btnAdd.addEventListener('click', (e) => {
      e.preventDefault();

      if (!checkInput(input)) {
        return
      }

      const inputValue = input.value;
      // Получаю и отрисовываю изображения
      VK.get(inputValue.trim(), App.imageViewer.drawImages);
    })
  }
}