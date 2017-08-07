# Настройки окружения для запуска unit-tests.

1. Проверьте, что на вашем компьютере установлена JRE. Проверить это можно с помощью комманды `java --version`.

2. Запусть `npm i`.

3. Глобально установить [mocha](https://github.com/mochajs/mocha), [chai](https://github.com/chaijs/chai), [ts-node](https://github.com/TypeStrong/ts-node), [typings](https://github.com/typings/typings) с помощью комманды `npm install mocha chai ts-node typings -g`.

4. Установим определения типов с помощью комманды `typings install dt~mocha --global --save` и `typings install npm~chai --save`

# Запуск serverless-offline

1. С помощью команды `sls dynamodb install` следует установить локально базу данных.

2. Запускаем serverless-offline с помощью команды `sls offline start`. Автоматичски будет запущена бд и serverless.

3. С помощью комманды `npm test` будут запущены unit тесты.

# Возможные проблемы

- данная ошибка возникает, если не установлен JRE, либо забыли установить БД локально - решается с помощью команды`sls dynamodb install`
```
events.js:160
      throw er; // Unhandled 'error' event
      ^

Error: spawn java ENOENT
```