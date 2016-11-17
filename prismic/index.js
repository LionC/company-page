const cache = require('persistent-cache');
const Prismic = require('prismic.io');
const util = require('util')

var exp = {
    products: [],
    team: [],
    blog: [],
    pages: []
};

const typeMap = {
    'team-member': 'team',
    'product': 'products',
    'blog-post': 'blog',
    'page': 'pages'
};

function fetchData() {
    return Prismic.api("https://aco-company-page.prismic.io/api").then(function(api) {
        return api.query("");
    }).then(function(response) {
        response.results.forEach(function (doc) {
            exp[typeMap[doc.type]].push(doc);
        });
    }).catch(function(err) {
        console.err("Something went wrong: ", err);
    });
}

function refetch() {
    exp.ready = fetchData();
}

exp.ready = fetchData();

module.exports = exp;
