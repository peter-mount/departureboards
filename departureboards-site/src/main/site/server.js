var express = require('express');
var morgan = require('morgan');
var request = require('request');
var layout = require('./layout');

var app = express();

// log everything to console
app.use(morgan('dev'));

// Static content
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/images', express.static('images'));

// No APP Icons, can cause browser bug - http://stackoverflow.com/a/25495711
app.get('/favicon.ico', function (req, res)
{
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
});

// Proxy api requests
app.use('/api', function (req, resp) {
    req.pipe(request({
        url: process.env.APIURI + req.url,
        qs: req.query,
        method: req.method
    }, function (error, response, body) {
        console.error(error);
        if (error.code === 'ECONNREFUSED') {
            console.error('Refused connection: ' + req.url + " ? " + req.query);
        }
        resp.writeHead(500);
        resp.end();
    })).pipe(resp);
});

// Home page
app.get('/', function (req, resp) {
    layout.show(req, resp, {
        "title": "UK Departure Boards",
        "banner": layout.homeButtons,
        "footer": layout.footer,
        "body": function (req, resp, p) {
            layout.include(resp, 'public/home.html');
        }
    });
});

// Start the application, log an entry to say we are running
app.listen(80, function () {
    console.log('Started');
});
