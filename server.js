var assert = require('assert');
var express = require('express');
var bodyParser = require('body-parser');

var prismicData = require('./prismic');

var PORT = process.env.PORT || 8080;
var PRISMIC_SECRET = process.env.PRISMIC_SECRET || 'secret';

var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));

//Prismic Webhook route
app.post('/api/prismic-webhook', bodyParser.json(), function (req, res) {
    if(req.body.secret != PRISMIC_SECRET)
        return res.status(401).send('');

    prismicData.refetch();
    return res.status(200).send('');
});

//Default route
app.get('/', function(req, res) { res.redirect('/en/aboutus') });

//General page route
app.get('/:lang/:uid', renderPage);

//Blog post route
app.get('/:lang/blog/:uid', function (req, res) {
    //TODO: Create blog post map
    var blogPost = prismicData.blog.filter(function (post) {
        return post.uid == req.params.uid;
    })[0];

    if(!blogPost)
        return res.status(404).send();

    return render(req, res, {
        headTemplate: 'blog-post-head',
        template: 'blog-post',
        blogPost: blogPost
    });
});

function renderPage(req, res) {
    var page = prismicData.pages.filter(function (p) {
        return p.uid == req.params.uid;
    })[0];

    if(!page)
        return res.status(404).send();

    return render(req, res, {
        headTemplate: 'page-head',
        template: 'page',
        page: page
    });
}

function render(req, res, params) {
    params = params || {};

    var defaultParams = {
        lang: req.params.lang,

        products: prismicData.products,
        team: prismicData.team,
        blog: prismicData.blog,
        pages: prismicData.pages,
        workflow: prismicData.workflow[0],

        languageLinks: buildLanguageLinks(req.path)
    };

    for(var i in defaultParams) {
        //TODO: Introducing boolean params with a default will break this
        params[i] = params[i] || defaultParams[i];
    }

    res.render('index', params);
}

function startServer() {
    var server = app.listen(PORT, function() {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Listening on' + host + ':' + port);
    });
}

var LANGUAGES = [ 'en', 'de' ];

function buildLanguageLinks(path) {
    var relativePath = path.substr(3);
    var ret = {};

    LANGUAGES.forEach(function (language) {
        ret[language] = '/' + language + relativePath;
    });

    return ret;
}

prismicData.ready.then(startServer);
