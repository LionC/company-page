const cache = require('persistent-cache');
const Prismic = require('prismic.io');
const util = require('util');
var Promise = require('promise');

var exp = {
    products: [],
    team: [],
    blog: [],
    pages: []
};

const types = {
    'team-member': {
        expKey: 'team',
        ordered: true
    },
    'product': {
        expKey: 'products',
        ordered: true
    },
    'blog-post': {
        expKey: 'blog',
        ordered: false
    },
    'page': {
        expKey: 'pages',
        ordered: true
    }
};

function fetchPage(page, type, ordered) {
    var config = {
        pageSize: 100,
        page: page
    };

    if(ordered) {
        config.orderings = [
            "[my." + type + ".order]"
        ];
    }

    return Prismic.api("https://aco-company-page.prismic.io/api").then(function(api) {
        return api.query([
            Prismic.Predicates.at("document.type", type)
        ], config);
    }).then(function(response) {
        response.results.forEach(function (doc) {
            exp[types[doc.type].expKey].push(doc);
        });

        return response.next_page != null ? fetchPage(response.page + 1) : true;
    }).catch(function(err) {
        console.err("Something went wrong: ", err);
    });
}

function fetchDocuments(type, ordered) {
    return fetchPage(1, type, ordered);
}

function fetchData() {
    var promises = [];

    for(var type in types)
        promises.push(fetchDocuments(type, types[type].ordered));

    return Promise.all(promises);
}

function refetch() {
    for(var i in exp)
        if(typeof exp[i] != 'function')
            exp[i] = [];

    exp.ready = fetchData();
}

exp.ready = fetchData();
exp.refetch = refetch;

module.exports = exp;
