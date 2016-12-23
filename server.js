const assert = require('assert')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const request = require('request')
const assertSuccessfulResponse = require('assert-successful-request')

var prismicData = require('./prismic')

var PORT = process.env.PORT || 8080
var PRISMIC_SECRET = process.env.PRISMIC_SECRET || 'secret'

var LANGUAGES = [ 'en', 'de' ]
var TRANSLATIONS = require('./translations.json')

function buildTranslationFunction(language) {
    return function translate(key) {
        return TRANSLATIONS[key][language]
    }
}

var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(compression());

//Prismic Webhook route
app.post('/api/prismic-webhook', bodyParser.json(), function (req, res) {
    if(req.body.secret != PRISMIC_SECRET)
        return res.status(401).send('');

    prismicData.refetch();
    return res.status(200).send('');
});

app.post('/api/contact', bodyParser.urlencoded(), function(req, res) {
    return request.post({
        url: 'https://rest.acomodeo.com/api/inquiry',
        json: true,
        body: req.body
    }).pipe(res)
});

//Default route
app.get('/', function(req, res) { res.redirect('/en/aboutus') });

app.get('/sitemap', function (req, res) {
    res.set('Content-Type', 'text/xml');

    res.render('sitemap', {
        host: req.hostname,
        languages: LANGUAGES,
        pages: prismicData.pages
    });
});

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
        successStories: prismicData.successStories,
        languages: LANGUAGES,
        host: req.hostname,

        languageLinks: buildLanguageLinks(req.path),
        buildAnchor: buildAnchor,
        __: buildTranslationFunction(req.params.lang)
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


function buildLanguageLinks(path) {
    var relativePath = path.substr(3);
    var ret = {};

    LANGUAGES.forEach(function (language) {
        ret[language] = '/' + language + relativePath;
    });

    return ret;
}

function buildAnchor(name) {
    return name.toLowerCase().replace(/\s/g, '-');
}

prismicData.ready.then(startServer);
