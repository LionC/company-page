var assert = require('assert');
var express = require('express');

var PORT = process.env.PORT || 8080;

var app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/static'));

app.get('/', render);

function render(req, res) {
    res.render('index');
}

var server = app.listen(PORT, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening on' + host + ':' + port);
});
