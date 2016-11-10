var assert = require('assert');
var express = require('express');

var prismicData = require('./prismic');

var PORT = process.env.PORT || 8080;

var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.get('/', function(req, res) { res.redirect('/en/aboutus') });
app.get('/:lang/:page', render);

function render(req, res) {
    res.render('index', {
        page: req.params.page,
        products: prismicData.products,
        team: prismicData.team,
        blog: prismicData.blog,
        lang: req.params.lang
    });
}

function startServer() {
    var server = app.listen(PORT, function() {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Listening on' + host + ':' + port);
    });
}

prismicData.ready.then(startServer);
