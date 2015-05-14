//--------------------------------------------------------------------------------------------------

var Socket = $.extend(
    
/*--------------------------------------------------------------------------------------------------
|
| -> Свойства
|
|-------------------------------------------------------------------------------------------------*/

    {public: {onChange: null}},// Пользовательский обработчик состояний соединения
    
/*--------------------------------------------------------------------------------------------------
|
| -> Создает консоль
|
|-------------------------------------------------------------------------------------------------*/

    {private: {consoleCreate: function() {
        if (this.isConsole) {
        // Список цветов для консоля
            this.colors = {
                'Client': ['Client', '0080FF'],
                'Server': ['Server', '008000'],
                'Access.Error': ['Server', 'FF0000'],
                'Access.Good': ['Server', '008000'],
                'Console': ['Console', 'FFFFFF']
            };
            
        // Создаем консоль
            this.div = document.createElement('div');
            
        // Добавляем консолю стиль
            this.div.style.position = 'absolute';
            this.div.style.left = 0;
            this.div.style.right = 0;
            this.div.style.bottom = 0;
            this.div.style.padding = '5px';
            this.div.style.height = '290px';
            this.div.style.fontSize = '12px';
            this.div.style.fontFamily = "'Ubuntu Mono', Menlo, Consolas, monospace";
            this.div.style.whiteSpace = 'pre-wrap';
            this.div.style.background = '#003A58';
            this.div.style.overflowY = 'auto';
            
        // Создаем контент
            var content = document.createElement('div');
            
        // Добавляем контенту стиль
            content.style.position = 'absolute';
            content.style.top = 0;
            content.style.left = 0;
            content.style.right = 0;
            content.style.bottom = '300px';
            content.style.overflowY = 'auto';
            
        // Добавляем body в контент
            content.innerHTML = document.body.innerHTML;
            
        // Отчищаем body
            document.body.innerHTML = '';
            
        // Добавляем контент на сцену
            document.body.appendChild(content);
            
        // Добавляем консоль на сцену
            document.body.appendChild(this.div);
        }
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Выводит сообщение в консоль
|
|-------------------------------------------------------------------------------------------------*/

    {public: {console: function(message, status, event) {
        if (this.isConsole) {
            status = status || 'Console';
            this.div.innerHTML = '<div style="color:#' + this.colors[status][1] + '">' + (status == 'Console' ? '' : (event ? '<b>' + event + ':</b> ' : '<b>' + this.colors[status][0] + ':</b> ')) + message + '</div>' + this.div.innerHTML;
        }
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Добавляет новый обработчик
|
|-------------------------------------------------------------------------------------------------*/

    {public: {on: function(event, callback) {
    // Создаем список событий
        if (!this.events) {
            this.events = {};
        }
        
    // Создаем новое событие
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
    // Добавляем новый обработчик
        this.events[event][this.events[event].length] = callback;
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Инициализирует событие
|
|-------------------------------------------------------------------------------------------------*/

    {public: {emit: function(event, success) {
    // Проверяем наличие события
        if (this.events && this.events[event]) {
        // Проходим по списку обработчиков события
            for (var i = 0; i < this.events[event].length; i++) {
            // Запускаем обработчик
                this.events[event][i].call(this, success);
            }
        }
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Добавляет обработчик ошибок
|
|-------------------------------------------------------------------------------------------------*/

    {public: {error: function(event, callback) {
    // Добавляем обработчик ошибок
        this.on(event, function(success) {
        // Выводим сообщение об ошибке
            this.change('error', callback ? callback(success) : 'Ошибка!');
        });
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Добавляет обработчик авторизации
|
|-------------------------------------------------------------------------------------------------*/

    {public: {access: function(event, msg) {
    // Добавляем обработчик успешной авторизации
        this.on(event, function(success) {
        // Запускаем обработчик полной загрузки
            this.onload('access', success);
            
        // Переходим к инициализации
            this.change('init');
        });
        
    // Добавляем callback для отправки запроса на авторизацию
        this.onAccess = function() {
        // Отправляем запрос на авторизацию
            this.send(event, msg);
        };
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Добавляет обработчик инициализации
|
|-------------------------------------------------------------------------------------------------*/

    {public: {init: function(event, msg) {
    // Добавляем обработчик завершения инициализации
        this.on(event, function(success) {
        // Запускаем обработчик полной загрузки
            this.onload('init', success);
            
        // Переходим к завершению инициализации
            this.change('complete');
        });
        
    // Добавляем callback для отправки запроса на инициализацию
        this.onInit = function() {
        // Отправляем запрос на инициализацию
            this.send(event, msg);
        };
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Системный обработчик состояний соединения
|
|-------------------------------------------------------------------------------------------------*/

    {private: {change: function(status, error_msg) {
    // Запускаем пользовательский обработчик состояний соединения
        if (this.onChange) {
            this.onChange(status, error_msg);
        }
        
    // Обрабатываем ошибку
        if (status == 'error') {
        // Записываем в лог
            this.console(error_msg, 'Access.Error');
        }
        
    // Переходим к авторизации
        if (status == 'access') {
        // Записываем в лог
            this.console('Соединение установлено!', 'Access.Good');
            
        // Отправляем запрос на авторизацию
            if (this.onAccess) {
                this.onAccess();
            }
            
        // Переходим к инициализации
            else {
                this.change('init');
            }
        }
        
    // Переходим к инициализации
        if (status == 'init') {
        // Отправляем запрос на инициализацию
            if (this.onInit) {
                this.onInit();
            }
            
        // Переходим к завершению инициализации
            else {
                this.change('complete');
            }
        }
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Инициализирует соединение с сервером
|
|-------------------------------------------------------------------------------------------------*/

    {public: {connect: function(url, onload, isConsole) {
    // Указатель
        var t = this;
        
    // Включаем консоль (true =  вкл. / false = выкл.)
        this.isConsole = isConsole;
        
    // Создаем консоль
        this.consoleCreate();
        
    // Добавляем обработчик полной загрузки
        t.onload = function(status, success) {
        // Не задан обработчик полной загрузки
            if (!onload) return;
            
        // Переход к инициализации еще не наступил
            if (t.onInit && status != 'init') return;
            
        // Переход к авторизации еще не наступил
            if (t.onAccess && status == 'connect') return;
            
        // Запускаем обработчик полной загрузки
            onload.call(t, success);
        };
        
    // Проверка поддержки браузером
        if (!window.WebSocket) {
            t.change('error', 'Ваш браузер не поддерживает технологию WebSocket.');
            return;
        }
        
    // Соединяемся с сервером
        t.change('connect');
        
    // Создаем экземпляр WebSocket
        t.socket = new WebSocket(url);
        
    // Добавляем обработчик разрыва соединения
        t.socket.onclose = function() {
        // Выводим сообщение об ошибке
            t.change('error', 'Соединение прервано!');
        };
        
    // Добавляем обработчик успешного соединения
        t.socket.onopen = function() {
        // Запускаем обработчик полной загрузки
            t.onload('connect');
            
        // Переходим к авторизации
            t.change('access');
        };
        
    // Добавляем обработчик сообщений
        t.socket.onmessage = function(success) {
        // Извлекаем данные
            var data = success.data;
            
        // Конвертируем из JSON
            success = JSON.parse(data);
            
        // Записываем в консоль
            this.console(data, 'Server', success['event']);
            
        // Запускаем обработчик события
            t.emit(success['event'], success);
        };
    }}},
    
/*--------------------------------------------------------------------------------------------------
|
| -> Отправляет сообщение
|
|-------------------------------------------------------------------------------------------------*/

    {public: {send: function(event, msg) {
    // По умолчанию пустой объект
        msg = typeof(msg) == 'object' ? msg : {};
        
    // Тип события
        msg['event'] = event;
        
    // Конвертируем в JSON
        var json = JSON.stringify(msg);
        
    // Отправляем сообщение
        this.socket.send(json);
        
    // Записываем в консоль
        this.console(json, 'Client', event);
    }}}
);

//--------------------------------------------------------------------------------------------------