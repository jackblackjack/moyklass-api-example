# moyklass-api-example
## Тестовое задание на разработку отчета по занятиям.

### Шаги установки
1. Установка модулей
```
npm install
```
2. Конфигурирование
<br>Установите соответствующие значения файла config/default.js:
* server -> hostname
* server -> port
* databases -> sequelize -> host
* databases -> sequelize -> username
* databases -> sequelize -> password

3. Заполнение базы данных фейковыми данными
```
npm run seed
```

4. Заполнение базы данных фейковыми данными
```
npm run build
```

5. Запуск
```
npm run start
```
