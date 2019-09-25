## Задание 1. «Конвертер валют»
Напишите веб-приложение, «конвертер валют», которое позволит пользователю
пересчитывать суммы денег между разными валютами по текущему курсу
на момент конвертации. В качестве источника информации о курсе валют
можете использовать любой API, который сочтете подходящим, если он не требует
регистрации от проверяющего выполнение задачи.

Для конечного пользователя должен быть предоставлен интерфейс в виде страницы,
где пользователь может указать исходную сумму, исходную валюту и целевую
валюту перевода, и после этого увидеть итоговую сумму.

Реализация:
В приложении используется [API ЦБ РФ](https://www.cbr-xml-daily.ru/ "API ЦБ РФ")

В файле api_cs.js реализована логика работы приложения, которы выполняется при загрузки страницы. Для получения данных был выбран json, 
так как он является самым популярным и удобным для работы с данными. Все полученные наименования добавляются в список select.
При изменнии option изменяется сумма при переводе. Если api не будет доступно, приложение отобразит данное сообщение на экране.

За оформление отвечает bootstrap.

Как можно ещё расширить приложение:
- кнопку reverse для select;
- дополнительное подключение к другому api, для увеличения отказоустойчивости приложения, при отключении одного из api;
- минимизация файлов для увеличения скорости загрузки страницы.

#### установка 
Так как основной функционал реализуется в браузерном окружении, то приложение не требует отдельной устновки. 
Достаточно открыть index.html в браузере.