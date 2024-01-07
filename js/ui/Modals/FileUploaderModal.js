/**
 * Класс FileUploaderModal
 * Используется как всплывающее окно для загрузки изображений
 */
class FileUploaderModal extends BaseModal {
  constructor(element) {
    super(element);

    this.btnCloseModal = this.DOMelement.querySelector('i.x.icon');
    this.btnCloseModal2 = this.DOMelement.querySelector('div.ui.close.button');
    this.btnSendAll = this.DOMelement.querySelector('div.ui.send-all.button');
    this.contentContainer = this.DOMelement.querySelector('div.scrolling.content');
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по кнопке "Закрыть" на всплывающем окне, закрывает его
   * 3. Клик по кнопке "Отправить все файлы" на всплывающем окне, вызывает метод sendAllImages
   * 4. Клик по кнопке загрузке по контроллерам изображения: 
   * убирает ошибку, если клик был по полю вода
   * отправляет одно изображение, если клик был по кнопке отправки
   */
  registerEvents() {
    // клик по крестику
    this.btnCloseModal.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
    });

    // клик по кнопке "закрыть"
    this.btnCloseModal2.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
    });

    // клик по кнопке "отправить всё"
    this.btnSendAll.addEventListener('click', (e) => {
      e.preventDefault();

      this.sendAllImages();
    });

    this.contentContainer.addEventListener('click', e => {
      e.preventDefault();

      // если клик по кнопке загрузить 1 фото
      if (
        (e.target.tagName === 'BUTTON' && e.target.className == 'ui button') ||
        (e.target.tagName === 'I' && e.target.className.includes('upload icon'))
      ) {
        this.sendImage(e.target.closest('div.image-preview-container'));
      }
    })
  }

  /**
   * Отображает все полученные изображения в теле всплывающего окна
   */
  showImages(images) {
    images = Array.from(images);
    images.reverse();

    if (images.length === 0) {
      this.close();
      return
    }

    const imagesHTML = new Array();
    images.forEach(img => {
      imagesHTML.push(this.getImageHTML(img));
    });

    this.contentContainer.innerHTML = imagesHTML.join('\n');
  }

  /**
   * Формирует HTML разметку с изображением, полем ввода для имени файла и кнопкной загрузки
   */
  getImageHTML(item) {
    const imageHTMLString =
      `<div class="image-preview-container">
        <img src='${item}' />
        <div class="ui action input">
          <input type="text" placeholder="Путь к файлу">
          <button class="ui button"><i class="upload icon"></i></button>
        </div>
       </div>`;

    return imageHTMLString;
  }

  /**
   * Отправляет все изображения в облако
   */
  sendAllImages() {
    const imagesContainers = this.contentContainer.querySelectorAll('div.image-preview-container');


    for (const img of Array.from(imagesContainers)) {
      this.sendImage(img);
    }
  }

  /**
   * Валидирует изображение и отправляет его на сервер
   */
  sendImage(imageContainer) {
    let inputFilename = imageContainer.querySelector('input').value;
    const inputBlock = imageContainer.querySelector('div.ui.action.input');
    if (!inputFilename) {
      inputBlock.classList.add('error');
      return
    }

    inputBlock.classList.add('disabled');
    const imageSrc = imageContainer.querySelector('img').src;

    // добавляю расширение файла
    const fileExt = imageSrc.split('.');
    inputFilename += '.' + fileExt[fileExt.length - 1].split('?')[0];

    Yandex.uploadFile(inputFilename, imageSrc, (code, response) => {

      if (code === 202) {
        // если загрузка успешна
        imageContainer.remove();

        if (this.contentContainer.querySelectorAll('div.image-preview-container').length === 0) {
          // если контейнер пустой закрыть модальное окно
          App.getModal('fileUploader').close();
        }

      } else {
        // ошибка
        console.error(`Код: ${code}\nОшибка загрузки файла.\nОтвет сервера:\n ${JSON.stringify(response)}`);
      }
    });
  }
}