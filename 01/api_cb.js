// ссылка апи
let url = 'https://www.cbr-xml-daily.ru/daily_json.js';
document.addEventListener("DOMContentLoaded", doRequest(url));
document.getElementById('not__working').style.display = 'none';
//запроса к апи
async function doRequest(url_api) {
    try {
        let response = await fetch(url_api);
        let data = await response.json();

        for (const key in data.Valute) {
            from_monet_value.options[from_monet_value.options.length] = new Option(key + ' ' + data.Valute[key].Name, key);
            to_monet_value.options[to_monet_value.options.length] = new Option(key + ' ' + data.Valute[key].Name, key);
        }
        return data;
    } catch (err) {
        document.getElementById('calc').style.display = 'none';
        document.getElementById('not__working').style.display = 'block';
    }
}
// перевод данных из input val1 / val2
var remitt = (data) => {
    var from_monet_value = document.getElementById("from_monet_value").value;
    var to_monet_value = document.getElementById("to_monet_value").value;
    var count = document.getElementById('count').value;
    return((data.Valute[from_monet_value].Value / data.Valute[to_monet_value].Value) / (data.Valute[from_monet_value].Nominal / data.Valute[to_monet_value].Nominal) * count).toFixed(4);
}

var input = document.getElementById('count');

input.oninput = () =>{
    var r = document.getElementById('count_to_value');
    doRequest(url).then(result => {
        r.value = (remitt(result)).toLocaleString();
    })
};

from_monet_value.addEventListener('change', (event) => {
    var r = document.getElementById('count_to_value');
    doRequest(url).then(result => {
        r.value = (remitt(result)).toLocaleString();
    })
});

to_monet_value.addEventListener('change', (event) => {
    var r = document.getElementById('count_to_value');
    doRequest(url).then(result => {
        r.value = (remitt(result)).toLocaleString();
    })
});