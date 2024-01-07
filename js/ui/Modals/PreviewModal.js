/**
 * Класс PreviewModal
 * Используется как обозреватель загруженный файлов в облако
 */
class PreviewModal extends BaseModal {
  constructor(element) {
    super(element);

    this.btnCloseModal = this.DOMelement.querySelector('i.x.icon');
    this.loader = this.DOMelement.querySelector('i.asterisk.loading.icon.massive');
    this.contentContainer = this.DOMelement.querySelector('div.content');
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по контроллерам изображения: 
   * Отправляет запрос на удаление изображения, если клик был на кнопке delete
   * Скачивает изображение, если клик был на кнопке download
   */
  registerEvents() {
    // клик по крестику закрыть модальное окно
    this.btnCloseModal.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
    });

    // клик по content области
    this.contentContainer.addEventListener('click', (e) => {
      e.preventDefault();

      // если клик по кнопке "Удалить"
      if (
        (e.target.tagName === 'BUTTON' && e.target.className.includes('delete')) ||
        (e.target.tagName === 'I' && e.target.className.includes('trash icon'))
      ) {

        // определяю элементы считая что таргет - кнопка
        let deleteBtn = e.target;
        let deleteIcon = e.target.querySelector('i.trash.icon');
        let path = deleteBtn.getAttribute('data-path');

        if (e.target.tagName === 'I') {
          // если текущий target - иконка, переопределяю элементы
          deleteBtn = e.target.closest('button.ui.labeled.icon.red.basic.button.delete')
          deleteIcon = e.target;
          path = deleteBtn.getAttribute('data-path');
        }

        // добавляю иконку загрузки
        deleteIcon.className = 'icon spinner loading';
        // блокирую кнопку удаления
        deleteBtn.classList.add('disabled');
        Yandex.removeFile(path, (code, response) => {

          if (code === 204) {
            // если успешно удалено

            // удаляю элемент
            e.target.closest('div.image-preview-container').remove();

            if (this.contentContainer.querySelectorAll('div.image-preview-container').length === 0) {
              // закрываю модальное если контейнер пустой
              App.getModal('filePreviewer').close();
            }

          } else {
            // в случае ошибки удаления файла
            // возвращаю кнопку удаления, вывожу ошибку
            deleteIcon.className = 'trash icon';
            deleteBtn.classList.remove('disabled');
            console.error(`Код: ${code}\nОшибка удаления файла в облаке.\nОтвет сервера:\n ${JSON.stringify(response)}`)
          }
        });

      } else if (
        // если клик по кнопке "скачать"
        (e.target.tagName === 'BUTTON' && e.target.className.includes('download')) ||
        (e.target.tagName === 'I' && e.target.className.includes('download icon'))
      ) {
        const downloadURL = e.target.getAttribute('data-file');
        Yandex.downloadFileByUrl(downloadURL);
      }
    });
  }


  /**
   * Отрисовывает изображения в блоке всплывающего окна
   */
  showImages(data) {

    // компирую полученные данные и разворачиваю
    data = Array.from(data._embedded.items);
    // выбираю только изображения
    data = data.filter(item => item.media_type === 'image');
    if (data.length === 0) {
      this.close();
      return
    }
    data.reverse();

    const imageBlock = new Array();
    data.forEach(elem => {
      imageBlock.push(this.getImageInfo(elem));
    })

    this.contentContainer.innerHTML = imageBlock.join('\n');
  }

  /**
   * Форматирует дату в формате 2021-12-30T20:40:02+00:00(строка)
   * в формат «30 декабря 2021 г. в 23:40» (учитывая временной пояс)
   * */
  formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Europe/Moscow',
    }).format(Date.parse(date));;
  }

  /**
   * Возвращает разметку из изображения, таблицы с описанием данных изображения и кнопок контроллеров (удаления и скачивания)
   */
  getImageInfo(item) {
    const imagesPreviewContainerString =
      `<div class="image-preview-container">
      <img src="${item.file}" referrerpolicy="no-referrer"/>
      <table class="ui celled table">
      <thead>
        <tr><th>Имя</th><th>Создано</th><th>Размер</th></tr>
      </thead>
      <tbody>
        <tr><td>${item.name}</td><td>${this.formatDate(item.created)}</td><td>${(parseInt(item.size) / 1024).toFixed(1)}Кб</td></tr>
      </tbody>
      </table>
      <div class="buttons-wrapper">
        <button class="ui labeled icon red basic button delete" data-path='${item.path.replace('disk:/', '')}'>
          Удалить
          <i class="trash icon"></i>
        </button>
        <button class="ui labeled icon violet basic button download" data-file='${item.file}'>
          Скачать
          <i class="download icon"></i>
        </button>
      </div>
      </div>`;

    return imagesPreviewContainerString;
  }
}
