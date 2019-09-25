var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var hbs = require('hbs');
var cookieParser = require('cookie-parser');

var app = express();

app.set("view engine", "hbs");
app.use(cookieParser());
const urlencodedParser = bodyParser.urlencoded({extended: false});
// конфиг сервера
const port = 3001;
const ip = 'http://localhost:' + port;

// конфиги бд
var pool = mysql.createPool({connectionLimit: 300, host: 'localhost', user: 'ivan', password: '1234', database: 'shorten'});

function keyDB() {
    var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var keyLen = 5;
    var key = Array(keyLen).fill(alphabet).map(function (x) {
        return x[Math.floor(Math.random() * x.length)]
    }).join('');
    return key
}

app.post('/shorten', urlencodedParser, function (req, res) {
    var cookie = req.cookies.cookieName;

    if (cookie === undefined) {
        return res.redirect('/reg')
    } else {
        // создание данных для отправки в бд
        var data = {
            large_link: req.body.large__link,
            small_key: '/s/' + keyDB()
        }
        // проверка есть ли такой ключ в бд
        pool.query('SELECT COUNT(*) FROM links WHERE small_key = ?', '/s/' + keyDB(), function (error, results, fields) {
            if (error) {
                throw error;
            } else {
                for (const key in results[0]) {
                    if (results[0][key] == data.small_key) {
                        data.small_key = '/s/' + keyDB(); // если есть генерируем новый
                    }
                }
            }
        });

        pool.query('INSERT INTO links SET large_link = ?, small_key = ?, user_id = (SELECT id_user FROM user WHERE login_user = ?)', [
            data.large_link, data.small_key, cookie
        ], function (error, results, fields) {
            if (error) 
                throw error;
            
        });
        return res.redirect('/')
    }
})


app.get('/', function (req, res) {
    var cookie = req.cookies.cookieName;
    if (cookie === undefined) {
        return res.redirect('/reg');
    } else {
        pool.query('SELECT * FROM links WHERE user_id = (SELECT id_user FROM user WHERE login_user = ?) ORDER BY id_links DESC', cookie, function (error, results, fields) {
            if (error) {
                throw error;
            } else {
                results.name = cookie;
                // добавление имени хоста к ключу
                for (let i = 0; i < results.length; i++) {
                    if (results[i].small_key != undefined)
                        results[i].small_key = ip + results[i].small_key;
                }
                res.render('index.hbs', {results})
            }
        });
    }
})

// маршрут перенаправления пользователя по короткой ссылке 
app.get('/s/:id', urlencodedParser, function (req, res) {
    var post = req.url;
    pool.query('SELECT COUNT(*) FROM links WHERE small_key = ?', post, function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            for (const key in results[0]) { // проверяем есть ли такая ссылка в бд
                if (results[0][key] == 0) {
                    return res.status(404).send('Извините, данной ссылки не существует! 404');
                } else {
                    pool.query('SELECT * FROM links WHERE small_key = ?', post, function (error, results, fields) {
                        if (error) {
                            throw error;
                        } else {
                            var stats = results[0].stats + 1
                            pool.query('UPDATE links SET stats = ? WHERE small_key = ?', [
                                stats, post
                            ], function (error, results, fields) {
                                if (error) 
                                    throw error;
                            });
                            res.redirect(results[0].large_link);
                        }
                    });
                }
            }
        }
    });
});

app.get('/reg', function (req, res) {
    var cookie = req.cookies.cookieName;
    if (cookie === undefined) {
        res.render('reg.hbs')
    } else {
        res.redirect('/');
    }
})

// обработка данных формы регистрации
app.post('/login', urlencodedParser, function (req, res) {
    var data = req.body.login;
    pool.query('SELECT COUNT(*) FROM user WHERE login_user = ?', data, function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results[0]['COUNT(*)'] == 0) { // пользователь нет в бд?
                pool.query('INSERT INTO user SET login_user = ?', data, function (error, results, fields) {
                    if (error) 
                        throw error;
                    
                })
                // записываем в куки пользователя, если всё успешно и редиректим в главную
                res.cookie('cookieName', data, {
                    maxAge: 2592000000
                })
                return res.redirect('/');
            } else {
                res.render('reg.hbs')
                return res.redirect('/reg');
            }
        }
    })
})

app.listen(port, function () {
    console.log('Сервер запущен на порту: ' + port);
});
