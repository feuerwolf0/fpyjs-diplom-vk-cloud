/**
 * Класс VK
 * Управляет изображениями из VK. С помощью VK API.
 * С помощью этого класса будет выполняться загрузка изображений из vk.
 * Имеет свойства ACCESS_TOKEN и lastCallback
 * */
class VK {

  static ACCESS_TOKEN = '238bf9b9238bf9b9238bf9b97d209d30d12238b238bf9b9461efabfb07e550c606ec1a4';
  static lastCallback;
  static BASE_URL = 'https://api.vk.com/method/';
  static VERSION_API = '5.199'


  /**
   * Получает изображения
   * */
  static async get(id = '', callback) {

    // Проверяет наличие букв в строке
    String.prototype.isAlpha = function () {
      return /^[a-zA-Z]+$/.test(this);
    }

    /**
     * Получает data используя механизм jsonp
     * @param {*} url 
     * @returns data
     */
    function jsonp(url) {
      return new Promise((resolve, reject) => {
        let callbackName = 'callback' + Math.round(100000 * Math.random());
        window[callbackName] = function (data) {
          delete window[callbackName];
          document.body.removeChild(script);
          resolve(data);
        };

        const script = document.createElement('script');
        // формирую итоговый url
        url = url + '&' +
          'access_token=' + VK.ACCESS_TOKEN + '&' +
          'v=' + VK.VERSION_API + '&' +
          'callback=' + callbackName;
        console.log(url)
        script.src = url
        document.body.appendChild(script);
      })
    }

    async function getTrueUserId(id) {
      try {
        const url = VK.BASE_URL +
          'users.get' + '?' +
          'user_ids=' + id;

        const data = await jsonp(url);
        return data;
      }
      catch (err) {
        throw err;
      }
    }

    async function getUserProfilePhotos(id) {
      try {
        const url = VK.BASE_URL +
          'photos.get' + '?' +
          'owner_id=' + id + '&' +
          'album_id=' + 'profile' + '&' +
          'photo_sizes=1';

        const data = await jsonp(url);
        return data
      }
      catch (err) {
        throw err;
      }
    }

    this.lastCallback = callback;

    // Если в id есть буквы
    if (id.isAlpha) {
      const data = await getTrueUserId(id);
      try {
        id = data.response[0].id;
      }
      catch (error) {
        throw error;
      }
    }

    // получаю json ответ фотографий пользователя
    const data = await getUserProfilePhotos(id);
    this.processData(data.response);
  }

  /**
   * Передаётся в запрос VK API для обработки ответа.
   * Является обработчиком ответа от сервера.
   */
  static processData(result) {
    try {
      // создаю список самых больших изображений
      const listAllPhotos = result.items.map(item => item.sizes[item.sizes.length - 1].url);
      // передаю список ссылок на изображения в последний callback
      this.lastCallback(listAllPhotos);
      // сбрасываю последний callback
      this.lastCallback = () => { };
    }
    catch (err) {
      alert(err);
    }
  }
}



// onclick
// VK.get('dolphin1971', (data) => {
//   data.forEach(el => {
//     console.log(el)
//   });
// })