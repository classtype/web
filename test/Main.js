/*--------------------------------------------------------------------------------------------------
|
| -> Инициализируем сокет
|
|-------------------------------------------------------------------------------------------------*/

Onloader.on(function() {
// Добавляем пользовательский обработчик состояний соединения
    Socket.onChange = function(status, error_msg) {
    // Скрываем весь контент
        gl.id('error').className = 'hidden';
        gl.id('loading').className = 'hidden';
        gl.id('content').className = 'hidden';
        
    // Обрабатываем ошибку
        if (status == 'error') {
            gl.id('error').className = '';
            gl.id('error').innerHTML = 'Ошибка! ' + error_msg;
        }
        
    // Соединяемся с сервером
        if (status == 'connect') {
            gl.id('loading').className = '';
            gl.id('loading').innerHTML = 'Соединение с сервером...';
        }
        
    // Переходим к авторизации
        if (status == 'access') {
            gl.id('loading').className = '';
            gl.id('loading').innerHTML = 'Авторизация...';
        }
        
    // Переходим к инициализации
        if (status == 'init') {
            gl.id('loading').className = '';
            gl.id('loading').innerHTML = 'Инициализация...';
        }
        
    // Переходим к завершению инициализации
        if (status == 'complete') {
            gl.id('content').className = '';
        }
    };
    
// Добавляем обработчик ошибок
    Socket.error('Error', function(success) {
        return success['error_msg'];
    });
    
// Добавляем обработчик авторизации
    Socket.access('Access', {
        "userid": 1,
        "auth_key": 'test_key'
    });
    
// Добавляем обработчик инициализации
    Socket.init('War.init', {
        'war_id': 'war_id'// ID войны
    });
    
// Инициализируем соединение с сервером
    Socket.connect('wss://server.com', function(success) {
        Socket.send('getName', {id:1});
    }, true);
});

//--------------------------------------------------------------------------------------------------