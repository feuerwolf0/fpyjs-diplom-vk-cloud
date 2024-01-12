/**
 * Класс Yandex
 * Используется для управления облаком.
 * Имеет свойство HOST
 * */
class Yandex {
  static HOST = 'https://cloud-api.yandex.net/v1/disk';
  // папка в облаке с которой работает скрипт
  static mainFolderName = 'jsDiploma';

  /**
   * Метод формирования и сохранения токена для Yandex API
   */
  static getToken(overwrite=false) {
    let TOKEN_YA = null;
    TOKEN_YA = localStorage.getItem('TOKEN_YA');

    if (!TOKEN_YA || overwrite === true) {
      TOKEN_YA = prompt('Введите токен OAuth для Яндекс Диска');
      localStorage.setItem('TOKEN_YA', TOKEN_YA);
    }

    return TOKEN_YA;
  }

  /**
   * Метод проверки наличия папки в облаке
   */
  static checkFolder() {
    return new Promise((resolve, reject) => {
      createRequest({
        'url': this.HOST + '/resources',
        'method': 'GET',
        'headers': {
          'Authorization': 'OAuth ' + this.getToken()
          
        },
        'data': {
          'path': '/' + this.mainFolderName
        },
        'callback': (code, response) => resolve([code, response]) 
      });
    })
  }
  /**
   * Метод создает папку в облаке
   */
  static createFolder() {
    return new Promise((resolve, reject) => {
      createRequest({
        'url': this.HOST + '/resources',
        'method': 'PUT',
        'headers': {
          'Authorization': 'OAuth ' + this.getToken()
        },
        'data': {
          'path': '/' + this.mainFolderName
        },
        'callback': (code, response) => resolve([code, response])
      });
    })
  }
  /**
   * Метод загрузки файла в облако
   */
  static uploadFile(path, url, callback) {
    createRequest(
      {
        'url': this.HOST + '/resources/upload',
        'method': 'POST',
        'headers': {
          'Authorization': 'OAuth ' + this.getToken()
        },
        'data': {
          'path': this.mainFolderName + '/' + path,
          'url': url
        },
        'callback': callback
      });
  }

  /**
   * Метод удаления файла из облака
   */
  static removeFile(path, callback) {
    createRequest({
      'url': this.HOST + '/resources',
      'method': 'DELETE',
      'headers': {
        'Authorization': 'OAuth ' + this.getToken()
      },
      'data': {
        'path': '/' + path
      },
      'callback': callback
    });
  }

  /**
   * Метод получения всех загруженных файлов в облаке
   */
  static getUploadedFiles(callback) {
    createRequest({
      'url': this.HOST + '/resources',
      'method': 'GET',
      'headers': {
        'Authorization': 'OAuth ' + this.getToken()
      },
      'data': {
        'path': '/' + this.mainFolderName
      },
      'callback': callback
    });
  }

  /**
   * Метод скачивания файлов
   */
  static downloadFileByUrl(url) {
    const downloadElement = document.createElement('a');
    downloadElement.setAttribute('download', 'download');
    downloadElement.href = url;
    downloadElement.setAttribute('referrerpolicy', "no-referrer");

    document.body.appendChild(downloadElement);
    downloadElement.click();
    downloadElement.remove();
  }
}