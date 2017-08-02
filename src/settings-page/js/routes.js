'use strict';

/**
 * Route configuration for the AffilinetToolbar module.
 */
angular.module('AffilinetToolbar').config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise(function ($injector, $location) {

            if ($location.$$hash == '') {
                return $location.$$path;
            }
            return $location.$$hash;

        });

        $locationProvider.html5Mode(false);

        // Application routes
        $stateProvider
            .state('settings', {
                url: '/settings',
                templateUrl: 'templates/settings.html',
                controller: 'SettingsController'
            })
            .state('orders', {
                url: '/orders',
                templateUrl: 'templates/orders.html',
                controller: 'OrdersController'
            })

            .state('news', {
                url: '/news',
                templateUrl: 'templates/news.html',
                controller: 'NewsController'
            })
            .state('applynow', {
                url: '/applynow/:programId',
                templateUrl: 'templates/applyNow.html',
                controller: 'applyNowController'

            })
            .state('getVouchers', {
                url: '/getVouchers/:programId',
                templateUrl: 'templates/getVouchers.html',
                controller: 'getVouchersController'
            })
            .state('getCreatives', {
                url: '/getCreatives/:programId',
                templateUrl: 'templates/getCreatives.html',
                controller: 'getCreativesController'
            })
        ;


    }
]);