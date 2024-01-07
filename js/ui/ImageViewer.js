/**
 * Класс ImageViewer
 * Используется для взаимодействием блоком изображений
 * */
class ImageViewer {
  constructor(element) {
    this.element = element;
    this.imagePreview = document.querySelector('img.image');
    this.imagesPreviewContainer = document.querySelector('.images-list').querySelector('.row');
    this.btnShowUploadedFiles = document.querySelector('.show-uploaded-files');
    this.btnSend = document.querySelector('button.send');
    this.btnSelectAll = document.querySelector('.select-all');
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по изображению меняет класс активности у изображения
   * 2. Двойной клик по изображению отображает изображаения в блоке предпросмотра
   * 3. Клик по кнопке выделения всех изображений проверяет у всех ли изображений есть класс активности?
   * Добавляет или удаляет класс активности у всех изображений
   * 4. Клик по кнопке "Посмотреть загруженные файлы" открывает всплывающее окно просмотра загруженных файлов
   * 5. Клик по кнопке "Отправить на диск" открывает всплывающее окно для загрузки файлов
   */
  registerEvents() {

    // двойной клик по контейнеру картинок
    this.imagesPreviewContainer.addEventListener('dblclick', (e) => {
      e.preventDefault();

      // если двойной клик по картинке - отобразить ее в preview
      if (e.target.tagName === 'IMG') {
        this.imagePreview.src = e.target.src;
      }

      this.checkButtonText();
    });

    // клик по контейнеру картинок
    this.imagesPreviewContainer.addEventListener('click', (e) => {
      e.preventDefault();

      // если клик по картинке - отобразить ее в preview
      if (e.target.tagName === 'IMG') {
        e.target.classList.toggle('selected');
        this.imagePreview.src = e.target.src;
      }

      this.checkButtonText();
    });

    // по клику на кнопку выбрать все
    this.btnSelectAll.addEventListener('click', (e) => {
      e.preventDefault();

      const images = this.imagesPreviewContainer.querySelectorAll('img');
      const imagesSelected = Array.from(images).filter(img => img.className.includes('selected'));

      // если выбранных изображений > 0
      if (imagesSelected.length > 0) {
        imagesSelected.forEach(img => {
          img.classList.remove('selected');
        });

        this.checkButtonText();
      } else {
        images.forEach(img => {
          img.classList.add('selected');
        });
        this.checkButtonText();
      }

      this.checkButtonText();
    });

    this.btnShowUploadedFiles.addEventListener('click', (e) => {
      e.preventDefault();

      // открывает модальное окно class PreviewModal
      App.getModal('filePreviewer').open();

      // callback отрисовки загруженных файлов
      const getUploadedFilesCallback = (code, response) => {
        App.getModal('filePreviewer').showImages(response);
      }

      const checkAndHandleFolder = async () => {
        // проверяю наличие папки в облаке
        let [code, response] = await Yandex.checkFolder();

        if (code === 401) {
          // ошибка авторизации
          console.error(`Код: ${code}\nОшибка авторизации\nОтвет сервера:\n ${JSON.stringify(response)}`);
        } else if (code === 200) {
          // папка существует
          // получить файлы
          Yandex.getUploadedFiles(getUploadedFilesCallback);
        } else {
          // папка отсутсвует
          // создаю папку
          [code, response] = await Yandex.createFolder();

          if (code === 201) {
            // папка успешно создана
            // получить файлы
            Yandex.getUploadedFiles(getUploadedFilesCallback);

          } else {
            // ошибка
            console.error(`Код: ${code}\nОшибка создания папки ${Yandex.mainFolderName} в облаке\nОтвет сервера:\n${JSON.stringify(response)}`);
          }
        }
      }
      checkAndHandleFolder()
    });


    this.btnSend.addEventListener('click', (e) => {
      e.preventDefault();

      const selectedImages = this.imagesPreviewContainer.querySelectorAll('img.selected');
      const imagesUrls = Array.from(selectedImages).map(img => img.src);
      
      App.getModal('fileUploader').open();
      App.getModal('fileUploader').showImages(imagesUrls);
    });
  }

  /**
   * Очищает отрисованные изображения
   */
  clear() {
    this.imagesPreviewContainer.textContent = '';
  }

  /**
   * Отрисовывает изображения.
  */
  drawImages = (images) => {

    
    if (images.length !== 0) {
      // проверяю количество изображений
      this.btnSelectAll.classList.remove('disabled');
    }

    images.forEach(img => {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'four wide column ui medium image-wrapper';

      const imageElement = document.createElement('img');
      imageElement.src = img;

      imageContainer.appendChild(imageElement);

      this.imagesPreviewContainer.appendChild(imageContainer);
    });
  }

  /**
   * Контроллирует кнопки выделения всех изображений и отправки изображений на диск
   */
  checkButtonText() {
    // получаю все изображения
    const images = this.imagesPreviewContainer.querySelectorAll('img');
    // выбираю все выбранные изображения
    const imagesSelected = Array.from(images).filter((img) => img.className.includes('selected'));


    if (imagesSelected.length === 0) {
      this.btnSelectAll.textContent = 'Выбрать всё';
    } else {
      this.btnSelectAll.textContent = 'Снять выделение';
    }
    if (imagesSelected.length > 0) {
      // если хотя бы 1 изображение выбрано активировать кнопку "отправить"
      this.btnSend.classList.remove('disabled');
    } else {
      this.btnSend.classList.add('disabled');
    }
  }
}