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

exp.ready = Prismic.api("https://aco-company-page.prismic.io/api").then(function(api) {
    //return api.query(""); // An empty query will return all the documents
    return api.query("");
}).then(function(response) {
    response.results.forEach(function (doc) {
        exp[typeMap[doc.type]].push(doc);
    });
}).catch(function(err) {
    console.log("Something went wrong: ", err);
});

module.exports = exp;
