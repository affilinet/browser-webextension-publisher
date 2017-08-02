angular.module('AffilinetToolbar')

    .factory('LogonService', ['$http', '$moment', '$timeout', '$q', '$rootScope', '$window', 'BrowserExtensionService', function ($http, $moment, $timeout, $q, $rootScope, $window, BrowserExtensionService) {

        var endpointPublisherWebservice = 'https://api.affili.net/V2.0/';


        var token = false;
        var validUntil = false;
        var credentials = false;

        var _sendRequest = function (requestBody, method, soap_action, successCallback, errorCallback) {
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

        var _tokenMustBeRefreshed = function () {
            if (token === false) {
                return true;
            }
            if (validUntil === false || validUntil < new $moment().subtract(2, 'minutes')) {
                return true
            }
            return false
        };


        var _removeToken = function () {
            "use strict";
            token = false;
            validUntil = false;
        };

        var getToken = function () {
            var deferred = $q.defer();


            if (_tokenMustBeRefreshed()) {
                Logon().then(
                    function success(response) {
                        var localToken = response.data.Envelope.Body.CredentialToken.toString();
                        token = localToken;
                        validUntil = new $moment().add('20 minutes');
                        deferred.resolve(localToken);
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

        var _loadCreadentialsFromRootScope = function () {
            var deferred = $q.defer();

            var checkIfCredentialObjectIsSet = function () {
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
            var refreshIntervalId = null;
            refreshIntervalId = setInterval(checkIfCredentialObjectIsSet, 50);
            return deferred.promise;

        };

        var Logon = function () {
            var deferred = $q.defer();
            _loadCreadentialsFromRootScope().then(
                function success(credentials) {
                    var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:typ="http://affilinet.framework.webservices/types">' +
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


        var _checkCredentials = function (credentials) {
            var deferred = $q.defer();
            var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:typ="http://affilinet.framework.webservices/types">' +
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

            RemoveToken: function () {
                "use strict";
                _removeToken();
            },

            CheckCredentials: function (credentials) {
                "use strict";
                var deferred = $q.defer();
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
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

            GetMyPrograms: function () {
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                            '<soapenv:Header/>' +
                            '<soapenv:Body>' +
                            '<svc:GetProgramsRequest>' +
                            '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                            '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>100</pub:PageSize></svc:DisplaySettings>' +
                            '<svc:GetProgramsQuery>' +
                            //'<pub:ProgramIds><arr:int>'+programId +'</arr:int></pub:ProgramIds>'+
                            '<pub:PartnershipStatus>' +
                            '<pub:ProgramPartnershipStatusEnum>Active</pub:ProgramPartnershipStatusEnum>' +
                            //'<pub:ProgramPartnershipStatusEnum>Paused</pub:ProgramPartnershipStatusEnum>' +
                            //'<pub:ProgramPartnershipStatusEnum>Waiting</pub:ProgramPartnershipStatusEnum>' +
                            //'<pub:ProgramPartnershipStatusEnum>Cancelled</pub:ProgramPartnershipStatusEnum>' +
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherInbox">' +
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherInbox">' +
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherCreative" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody =
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
                var deferred = $q.defer();

                getToken().then(
                    function success(response) {
                        var requestBody =
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
            }


        }
    }])


;

