angular.module('AffilinetToolbar')

    .factory('LogonService', ['$http', '$moment', '$timeout', '$q', '$rootScope', '$window', 'BrowserExtensionService', function ($http, $moment, $timeout, $q, $rootScope, $window, BrowserExtensionService) {

        let endpointPublisherWebservice = 'https://api.affili.net/V2.0/';
        let endpointWidgetWebservice = 'https://productwidget.com/api/v1.0/';


        let token = false;
        let validUntil = false;
        let credentials = false;

        let _sendRequest = function (requestBody, method, soap_action, successCallback, errorCallback) {
            $http({
                method: 'POST',
                data: requestBody,
                url: endpointPublisherWebservice + method,
                headers: {
                    "SOAPAction": soap_action,
                    "Content-Type": 'text/xml; charset=utf-8'
                }
            }).then(successCallback, errorCallback);

        };

        let _tokenMustBeRefreshed =  () => {
            // Refresh token 2 minutes before it is invalid
            const now =  new $moment().add(2, 'minutes');
            if (token === false) {
                return true;
            }
            console.log('token will be valid for',  $moment(validUntil) - now, token)
            return validUntil === false || validUntil < now;
        };


        let _removeToken = function () {
            "use strict";
            token = false;
            validUntil = false;
        };

        let _getToken = function () {
            let deferred = $q.defer();


            if (_tokenMustBeRefreshed()) {
                Logon().then(
                    function success(response) {
                        let localToken = response.data.Envelope.Body.CredentialToken.toString();
                        token = localToken;
                        _getTokenExpiration(token).then(
                            (tokenExpResult) => {
                                let expirationDate = tokenExpResult.data.Envelope.Body.ExpirationDate.toString();
                                validUntil = new Date(expirationDate);
                                console.log('created a token, it is valid until', validUntil);
                                deferred.resolve(localToken);

                            },
                            (error) => {
                                console.log('error in get token expiration ', error);
                                validUntil = 0;
                                deferred.reject(error);
                            }
                        );
                    },
                    function error(response) {
                        deferred.reject(response);
                    }
                )
            } else {
                deferred.resolve(token);
            }
            return deferred.promise
        };


        let _getWidgetApiCredentials = function() {
            let deferred = $q.defer();
            _getToken().then(function(){
                "use strict";
                let httpConfig = {
                    params : {
                        publisherId :  $rootScope.credentials.publisherId,
                        credentialToken :  token,
                    }
                };
                deferred.resolve(httpConfig)

            }, function(error) {
                "use strict";
                deferred.reject(error)
            })
            return deferred.promise;
        }

        let _loadCreadentialsFromRootScope = function () {
            let deferred = $q.defer();

            let checkIfCredentialObjectIsSet = function () {
                BrowserExtensionService.storage.local.get(['publisherId', 'webservicePassword'], function(result) {
                    "use strict";
                    if (result.webservicePassword && result.publisherId) {
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

        let Logon = function () {
            let deferred = $q.defer();
            _loadCreadentialsFromRootScope().then(
                function success(credentials) {
                    let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:typ="http://affilinet.framework.webservices/types">' +
                        '<soapenv:Header/>' +
                        '<soapenv:Body>' +
                        '<svc:LogonRequestMsg>' +
                        '<typ:Username>' + credentials.publisherId.trim() + '</typ:Username>' +
                        '<typ:Password>' + credentials.webservicePassword.trim() + '</typ:Password>' +
                        '<typ:WebServiceType>Publisher</typ:WebServiceType>' +
                        '</svc:LogonRequestMsg>' +
                        '</soapenv:Body>' +
                        '</soapenv:Envelope>';
                    _sendRequest(requestBody, 'Logon.svc', 'http://affilinet.framework.webservices/Svc/ServiceContract1/Logon', deferred.resolve, deferred.reject);
                },
                function error(response) {
                    deferred.reject(response);
                });

            return deferred.promise
        };


        let _getTokenExpiration = function (token) {
            let deferred = $q.defer();
            let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc">' +
                        '   <soapenv:Header/>' +
                        '   <soapenv:Body>' +
                        '      <svc:CredentialToken>' + token  + '</svc:CredentialToken>' +
                        '   </soapenv:Body>' +
                        '</soapenv:Envelope>';
            _sendRequest(requestBody, 'Logon.svc', 'http://affilinet.framework.webservices/Svc/AuthenticationContract/GetIdentifierExpiration',deferred.resolve, deferred.reject);
            return deferred.promise;
        };


        let _checkCredentials = function (credentials) {
            let deferred = $q.defer();
            let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:typ="http://affilinet.framework.webservices/types">' +
                '<soapenv:Header/>' +
                '<soapenv:Body>' +
                '<svc:LogonRequestMsg>' +
                '<typ:Username>' + credentials.publisherId.trim() + '</typ:Username>' +
                '<typ:Password>' + credentials.webservicePassword.trim() + '</typ:Password>' +
                '<typ:WebServiceType>Publisher</typ:WebServiceType>' +
                '</svc:LogonRequestMsg>' +
                '</soapenv:Body>' +
                '</soapenv:Envelope>';
            _sendRequest(requestBody, 'Logon.svc', 'http://affilinet.framework.webservices/Svc/ServiceContract1/Logon', deferred.resolve, deferred.reject);

            return deferred.promise;

        };


        return {
            LoadCreadentialsFromRootScope: function () {
                "use strict";
                return _loadCreadentialsFromRootScope();
            },

            GetToken: function () {
                "use strict";
                return _getToken();
            },

            RemoveToken: function () {
                "use strict";
                _removeToken();
            },

            CheckCredentials: function (credentials) {
                "use strict";
                let deferred = $q.defer();
                _checkCredentials(credentials).then(
                    function success(response) {
                        deferred.resolve(response);

                    },
                    function error(response) {
                        deferred.reject(response);
                    }
                );
                return deferred.promise;

            },

            GetProgram: function (programId) {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:GetProgramsRequest>' +
                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>1</pub:PageSize></svc:DisplaySettings>' +
                            '<svc:GetProgramsQuery>' +
                            '<pub:ProgramIds><arr:int>' + programId + '</arr:int></pub:ProgramIds>' +
                            '<pub:PartnershipStatus>' +
                            '<pub:ProgramPartnershipStatusEnum>Active</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>NoPartnership</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Paused</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Waiting</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Refused</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Cancelled</pub:ProgramPartnershipStatusEnum>' +
                            '</pub:PartnershipStatus>' +
                            '</svc:GetProgramsQuery>' +
                            '</svc:GetProgramsRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },


            GetProgramInfoForIds: function (programIds) {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:GetProgramsRequest>' +
                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>100</pub:PageSize></svc:DisplaySettings>' +
                            '<svc:GetProgramsQuery>' +
                            '<pub:ProgramIds>';

                        angular.forEach(programIds, function (val, key) {
                            requestBody = requestBody + '<arr:int>' + val + '</arr:int>';
                        });
                        requestBody = requestBody +

                            '</pub:ProgramIds>' +
                            '<pub:PartnershipStatus>' +
                            '<pub:ProgramPartnershipStatusEnum>Active</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Paused</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Waiting</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Cancelled</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Refused</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>NoPartnership</pub:ProgramPartnershipStatusEnum>' +
                            '</pub:PartnershipStatus>' +
                            '</svc:GetProgramsQuery>' +
                            '</svc:GetProgramsRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },

            GetVouchers: function (programId) {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherInbox">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:SearchVoucherCodesRequest>' +
                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>100</pub:PageSize></svc:DisplaySettings>' +
                            '<svc:SearchVoucherCodesRequestMessage>' +
                            '<pub:ProgramId>' + programId + '</pub:ProgramId>' +
                            '</svc:SearchVoucherCodesRequestMessage>' +
                            '</svc:SearchVoucherCodesRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherInbox.svc', 'http://affilinet.framework.webservices/Svc/PublisherInboxContract/SearchVoucherCodes', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },

            GetNewVouchers: function () {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherInbox">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:SearchVoucherCodesRequest>' +
                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>10</pub:PageSize><pub:SortBy>StartDate</pub:SortBy><pub:SortOrder>Descending</pub:SortOrder></svc:DisplaySettings>' +
                            '<svc:SearchVoucherCodesRequestMessage>' +
                            '</svc:SearchVoucherCodesRequestMessage>' +
                            '</svc:SearchVoucherCodesRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherInbox.svc', 'http://affilinet.framework.webservices/Svc/PublisherInboxContract/SearchVoucherCodes', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },


            GetCreatives: function (programId) {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherCreative" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:SearchCreativesRequest>' +

                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>100</pub:PageSize></svc:DisplaySettings>' +

                            '<svc:SearchCreativesQuery>' +
                            '<pub:ProgramIds><arr:int>' + programId + '</arr:int></pub:ProgramIds>' +
                            '<pub:CreativeTypes>' +
                            '<pub:CreativeTypeEnum>Banner</pub:CreativeTypeEnum>' +
                            '<pub:CreativeTypeEnum>HTML</pub:CreativeTypeEnum>' +
                            '</pub:CreativeTypes>' +
                            '</svc:SearchCreativesQuery>' +
                            '</svc:SearchCreativesRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherCreative.svc', 'http://affilinet.framework.webservices/Svc/PublisherCreativeServiceContract/SearchCreatives', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },

            GetNewPrograms: function () {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:GetProgramsRequest>' +
                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>10</pub:PageSize><pub:SortByEnum>ProgramLifetime</pub:SortByEnum><pub:SortOrderEnum>Descending</pub:SortOrderEnum></svc:DisplaySettings>' +
                            '<svc:GetProgramsQuery>' +

                            '<pub:PartnershipStatus>' +
                            '<pub:ProgramPartnershipStatusEnum>Active</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>NoPartnership</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Paused</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Waiting</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Refused</pub:ProgramPartnershipStatusEnum>' +
                            '<pub:ProgramPartnershipStatusEnum>Cancelled</pub:ProgramPartnershipStatusEnum>' +
                            '</pub:PartnershipStatus>' +
                            '</svc:GetProgramsQuery>' +
                            '</svc:GetProgramsRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },

            GetDailyStatistics: function (start, end) {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody =
                            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherStatistics">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:GetDailyStatisticsRequest>' +

                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:GetDailyStatisticsRequestMessage>' +
                            '<pub:StartDate>' + start + '</pub:StartDate>' +
                            '<pub:EndDate>' + end + '</pub:EndDate>' +
                            '<pub:SubId></pub:SubId>' +
                            '<pub:ProgramTypes>All</pub:ProgramTypes>' +
                            '<pub:ValuationType>DateOfRegistration</pub:ValuationType>' +

                            '<pub:ProgramId>0</pub:ProgramId>' +
                            '</svc:GetDailyStatisticsRequestMessage>' +
                            '</svc:GetDailyStatisticsRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherStatistics.svc', 'http://affilinet.framework.webservices/Svc/PublisherStatisticsContract/GetDailyStatistics', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },


            GetAllProgramStatistics: function (start, end) {
                let deferred = $q.defer();

                _getToken().then(
                    function success(response) {
                        let requestBody =
                            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherStatistics">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:GetProgramStatisticsRequest>' +

                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:GetProgramStatisticsRequestMessage>' +
                            '<pub:StartDate>' + start + '</pub:StartDate>' +
                            '<pub:EndDate>' + end + '</pub:EndDate>' +
                            '<pub:SubId></pub:SubId>' +
                            '<pub:ProgramTypes>All</pub:ProgramTypes>' +
                            '<pub:ValuationType>DateOfRegistration</pub:ValuationType>' +

                            '<pub:ProgramIds></pub:ProgramIds>' +
                            '<pub:ProgramStatus>All</pub:ProgramStatus>' +
                            '</svc:GetProgramStatisticsRequestMessage>' +
                            '</svc:GetProgramStatisticsRequest>' +
                            '</soapenv:Body>' +
                            '</soapenv:Envelope>';

                        _sendRequest(requestBody, 'PublisherStatistics.svc', 'http://affilinet.framework.webservices/Svc/PublisherStatisticsContract/GetProgramStatistics', deferred.resolve, deferred.reject);

                    },
                    function error() {

                    }
                );
                return deferred.promise;
            },


            WidgetCreate : function(data) {
                let deferred = $q.defer();
                _getWidgetApiCredentials().then(
                    function(credentials) {
                        $http.post(endpointWidgetWebservice + 'widgets', data, credentials).then(deferred.resolve, deferred.reject)
                    }
                )
                return deferred.promise;
            },

            WidgetUpdate : function(id, data){
                let deferred = $q.defer();
                _getWidgetApiCredentials().then(
                    function(credentials) {
                        $http.put(endpointWidgetWebservice + 'widgets/' + id, data, credentials).then(deferred.resolve, deferred.reject)
                    }
                )
                return deferred.promise;
            },

            WidgetDelete : function(id, data){
                let deferred = $q.defer();
                _getWidgetApiCredentials().then(
                    function(credentials) {
                        $http.delete(endpointWidgetWebservice + 'widgets/' + id, credentials).then(deferred.resolve, deferred.reject)
                    }
                )
                return deferred.promise;
            },

            WidgetIndex : function(){
                let deferred = $q.defer();
                _getWidgetApiCredentials().then(
                    function(credentials) {
                        $http.get(endpointWidgetWebservice + 'widgets', credentials).then(deferred.resolve, deferred.reject)
                    }
                )
                return deferred.promise;
            },


        }
    }])


;

