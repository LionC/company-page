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

function fetchPage(page) {
    return Prismic.api("https://aco-company-page.prismic.io/api").then(function(api) {
        return api.query("", { pageSize : 100, page: page });
    }).then(function(response) {
        response.results.forEach(function (doc) {
            exp[typeMap[doc.type]].push(doc);
        });

        return response.next_page != null ? fetchPage(response.page + 1) : true;
    }).catch(function(err) {
        console.err("Something went wrong: ", err);
    });
}

function fetchData() {
    return fetchPage(1);
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
