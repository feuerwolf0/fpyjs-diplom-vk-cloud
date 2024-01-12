/**
 * Класс VK
 * Управляет изображениями из VK. С помощью VK API.
 * С помощью этого класса будет выполняться загрузка изображений из vk.
 * Имеет свойства ACCESS_TOKEN и lastCallback
 * */
class VK {
// геттер токена VK
  static getToken(overwrite=false) {
    let TOKEN_VK = localStorage.getItem('TOKEN_VK');
    if (!TOKEN_VK || overwrite === true) {
      TOKEN_VK = prompt('Введите токен VK');
      localStorage.setItem('TOKEN_VK', TOKEN_VK);
    }

    return TOKEN_VK
  };
  static lastCallback;
  static BASE_URL = 'https://api.vk.com/method/';
  static VERSION_API = '5.199';


  /**
   * Получает изображения
   * */
  static async get(id = '', callback) {

    // Проверяет наличие букв в строке
    String.prototype.isAlpha = function () {
      return /^[a-zA-Z]+$/.test(this);
    }

    // функция вывода ошибки
    function error(response, funcname) {
      if (response.error.error_code === 30) {
        alert(`Профиль пользователя приватный`);
        throw `Профиль пользователя приватный`;
      } else if (response.error.error_code === 5) {
        alert('Ошибка авторизации. \nНеверный VK token. \nБольше информации в консоли');
        console.error(`Ошибка в функции ${funcname}\nКод ошибки: ${response.error.error_code}\nТекст ошибки: ${response.error.error_msg}\nПолный ответ: \n${JSON.stringify(response.error)}`);
        VK.getToken(true);
        throw `Неверный токен VK\n`;
      } else {
        console.error(`Ошибка в функции ${funcname}\nКод ошибки: ${response.error.error_code}\nТекст ошибки: ${response.error.error_msg}\nПолный ответ: \n${JSON.stringify(response.error)}`);
        alert(`Ошибка в функции ${funcname}\nТекст: ${response.error.error_msg}\nПолный текст ошибки в консоли`);
        throw `Ошибка в функции ${funcname}`;
      }
    }

    /**
     * Получает data используя механизм jsonp
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
          'access_token=' + VK.getToken() + '&' +
          'v=' + VK.VERSION_API + '&' +
          'callback=' + callbackName;

        script.src = url;
        document.body.appendChild(script);
      })
    }

    async function getTrueUserId(id) {
      try {
        const url = VK.BASE_URL +
          'users.get' + '?' +
          'user_ids=' + id;

        const data = await jsonp(url);
        
        if (data.error) {
          error(data, 'getTrueUserId');
        }

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
        if (data.error) {
          error(data, 'getTrueUserId');
        }
        return data;
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
       alert(`Пользователь с ID ${id} не найден`);
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
      this.lastCallback = () => {};
    }
    catch (err) {
      alert(err);
      throw err;
    }
  }
}