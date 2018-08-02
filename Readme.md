# NOTIFY-ONLINE-SERVICE
  
**NOTIFY-ONLINE-SERVICE** является микросервисом рассылки онлайн-уведомлений для пользователей [golos.io](https://golos.io).
Также хранит в себе настройки рассылки. Предполагается что существует микросервис регистрации событий, который
оповещает этот микросервис о новых событиях, оставляя право фильтрации и непосредственной рассылки уже этому микросервису.

### API

 ```
 subscribe:
 {
     user: <string>        // Имя пользователя
     channelId: <string>   // Идентификатор канала
     requestId: <string>   // Идентификатор запроса
 }

 unsubscribe:
 {
     user: <string>        // Имя пользователя
     channelId: <string>   // Идентификатор канала
 }

 getOptions:
 {
     user: <string>        // Имя пользователя
 }

 setOptions:
 {
     user: <string>        // Имя пользователя
     data: <
        string(event) ->   // Тип события
        boolean(on/off)    // Рассылать или нет
     >
 }

 transfer:
     data: <
        string(user) ->    // Имя пользователя
        string(event) ->   // Тип события
        Object(eventData)  // Данные события (любой формат)
     >

 ```


### Переменные окружения

Возможные переменные окружения `ENV`:

  - `GLS_FACADE_CONNECT` *(обязательно)* - адрес подключения к микросервису фасаду.

  - `GLS_GATE_HOST` *(обязательно)* - адрес, который будет использован для входящих подключений связи микросервисов.
   Дефолтное значение при запуске без докера - `127.0.0.1`

  - `GLS_GATE_PORT` *(обязательно)* - адрес порта, который будет использован для входящих подключений связи микросервисов.
   Дефолтное значение при запуске без докера - `8080`, пересекается с `GLS_FRONTEND_GATE_PORT`

  - `GLS_METRICS_HOST` *(обязательно)* - адрес хоста для метрик StatsD.
   Дефолтное значение при запуске без докера - `127.0.0.1`

  - `GLS_METRICS_PORT` *(обязательно)* - адрес порта для метрик StatsD.
   Дефолтное значение при запуске без докера - `8125`

  - `GLS_MONGO_CONNECT` - строка подключения к базе MongoDB.
   Дефолтное значение - `mongodb://mongo/admin`

  - `GLS_DAY_START` - время начала нового дня в часах относительно UTC.
   Дефолтное значение - `3` (день начинается в 00:00 по Москве).

### Запуск

Для запуска достаточно вызвать команду `docker-compose up` в корне проекта, предварительно указав необходимые `ENV` переменные.    
