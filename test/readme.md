# Настройки окружения для запуска unit-tests.

1. Проверьте, что на вашем компьютере установлена JRE. Проверить это можно с помощью комманды `java --version`.

2. Запусть `npm i`.

3. Удостовериться, что стоит Node.js версии >=6.10.1 и <7.x.x.

4. Глобально установить [mocha](https://github.com/mochajs/mocha), [chai](https://github.com/chaijs/chai), [ts-node](https://github.com/TypeStrong/ts-node), [typings](https://github.com/typings/typings) с помощью комманды `npm install mocha chai ts-node typings -g`.

5. Установим определения типов с помощью комманды `typings install dt~mocha --global --save` и `typings install npm~chai --save`

# Запуск serverless-offline и тестирования

1. С помощью команды `sls dynamodb install` следует установить локально базу данных.

2. Запускаем serverless-offline с помощью команды `sls offline start`. Автоматичски будет запущена БД и serverless-offline.

3. С помощью комманды `npm test` будут запущены unit тесты и представлен отчет о покрытии кода тестами.

# Использованные пакеты

- [serverless-offline](https://github.com/dherault/serverless-offline)
- [serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
- [lambda-tester](https://github.com/vandium-io/lambda-tester)
- [istanbuljs](https://github.com/istanbuljs/istanbuljs)

# Возможные проблемы

- данная ошибка возникает, если не установлен JRE, либо забыли установить БД локально - решается с помощью команды`sls dynamodb install`
```
events.js:160
      throw er; // Unhandled 'error' event
      ^

Error: spawn java ENOENT
```

- данная ошибка возникает, если работа serverless-offline была завершена не правильно. Решается путем убивания процесса, который отвечает за работа dynamoDB-local.
```
WARN:oejuc.AbstractLifeCycle:FAILED SelectChannelConnector@0.0.0.0:8000: java.net.BindException: Адрес уже используется java.net.BindException: Адрес уже используется
 ```
