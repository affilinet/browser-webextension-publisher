angular.module('AffilinetToolbar')

    .factory('productWebservice', ['$http', '$window', '$timeout', '$q', '$rootScope', 'BrowserExtensionService', function ($http, $window, $timeout, $q, $rootScope, BrowserExtensionService) {

        let endpointPublisherWebservice = 'https://product-api.affili.net/V3/productservice.svc/JSON/';
        let credentials = false;

        let _sendRequest = function (params, method, successCallback, errorCallback) {
            $http({
                method: 'GET',
                params: params,
                url: endpointPublisherWebservice + method,
            }).then(successCallback, errorCallback);

        };

        let _loadCreadentialsFromRootScope = function () {
            let deferred = $q.defer();

            let checkIfCredentialObjectIsSet = function () {
                BrowserExtensionService.storage.local.get(['publisherId', 'productWebservicePassword'], function(result) {
                    "use strict";
                    if (result.productWebservicePassword && result.publisherId) {
                        clearInterval(refreshIntervalId);
                        deferred.resolve(result);
                        $rootScope.$broadcast('updateCredentials');
                        $rootScope.credentialsLoaded = true;
                        $rootScope.validCredentials = true;
                    } else {
                        deferred.reject('No Data found');
                        $rootScope.$broadcast('updateCredentials');
                        $rootScope.credentialsLoaded = true;
                        $rootScope.validCredentials = false;
                        clearInterval(refreshIntervalId);
                    }
                })
            };
            let refreshIntervalId = null;
            refreshIntervalId = setInterval(checkIfCredentialObjectIsSet, 50);
            return deferred.promise;
        };




        return {
            LoadCreadentialsFromRootScope: function () {
                "use strict";
                return _loadCreadentialsFromRootScope();
            },

            CheckLoginData : function(publisherId, productWebservicePassword) {
                let deferred = $q.defer();

                let params = {
                    PublisherId : publisherId,
                    Password : productWebservicePassword,
                    PageSize : 1
                };
                _sendRequest(params, 'GetShopList', deferred.resolve, deferred.reject);

                return deferred.promise;
            },

            GetShopList: function () {
                let deferred = $q.defer();

                _loadCreadentialsFromRootScope().then(
                    function success(credentials) {
                        let params = {
                            PublisherId : credentials.publisherId,
                            Password : credentials.productWebservicePassword,
                            PageSize : 5000
                        };
                        _sendRequest(params, 'GetShopList', deferred.resolve, deferred.reject);

                    },
                    function error($rootScope) {
                        console.error('Error retrieving shoplist');
                        $rootScope.sendAlert('Error retrieving shoplist', 'danger')
                    }
                );
                return deferred.promise;
            },


            GetCategoryList: function (shopId = 0) {
                let deferred = $q.defer();

                _loadCreadentialsFromRootScope().then(
                    function success(credentials) {
                        let params = {
                            PublisherId : credentials.publisherId,
                            Password : credentials.productWebservicePassword,
                            PageSize : 5000,
                            ShopId : shopId
                        };
                        _sendRequest(params, 'GetCategoryList', deferred.resolve, deferred.reject);

                    },
                    function error() {
                        $rootScope.sendAlert('Error retrieving category list', 'danger')
                    }
                );
                return deferred.promise;
            },

            SearchProducts : function (params) {

                let deferred = $q.defer();

                _loadCreadentialsFromRootScope().then(
                    function success(credentials) {

                        let data = {
                            PublisherId : credentials.publisherId,
                            Password : credentials.productWebservicePassword,
                        };
                        const requestParams = Object.assign({}, data, params);
                        _sendRequest(requestParams, 'SearchProducts', deferred.resolve, deferred.reject);

                    },
                    function error(error) {
                        console.error(error);
                        $rootScope.sendAlert('Error retrieving result', 'danger')
                    }
                );
                return deferred.promise;
                
            },

            GetProducts : function (productIds) {

                let deferred = $q.defer();

                _loadCreadentialsFromRootScope().then(
                    function success(credentials) {

                        let data = {
                            PublisherId : credentials.publisherId,
                            Password : credentials.productWebservicePassword,
                            ProductIds: productIds.join(','),
                            ImageScales: 'Image180'
                        };
                        _sendRequest(data, 'GetProducts', deferred.resolve, deferred.reject);

                    },
                    function error() {
                        "use strict";
                        $rootScope.sendAlert('Error retrieving result', 'danger')
                    }
                );
                return deferred.promise;

            }





        }
    }])


;

