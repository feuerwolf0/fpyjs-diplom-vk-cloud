/**
 * Основная функция для совершения запросов по Yandex API.
 * */
const createRequest = (options = {}) => {
    let url = options['url'];
    const method = options['method'];
    const headers = options['headers'];
    let data = options['data'];
    const callback = options['callback'];
    if (data) {
        const params = Object.keys(data)
            .map(key => `${key}=${encodeURIComponent(data[key])}`)
            .join('&');

        // добавляю параметры для url
        url += '?' + params;
    }

    const xhr = new XMLHttpRequest();

    xhr.addEventListener('load', (e) => {
        callback(xhr.status, xhr.response);
    });

    try {
        xhr.open(method, url);
        xhr.responseType = 'json';
        // устанавливаю заголовки
        if (headers) {
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
        }
        
        xhr.send();
    }
    catch (error) {
        console.error(error);
    }
};
