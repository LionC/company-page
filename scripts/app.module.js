(function() {
    'use strict';

    angular.module('acoPage', [
        'ui.router'
    ]).config([
        '$stateProvider',
        '$urlRouterProvider',
        config
    ]);

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
    }

}());
