angular.module('AffilinetToolbar')
    .controller('SettingsController', ['$scope', '$rootScope', '$window', '$translate', 'LogonService', 'productWebservice', 'BrowserExtensionService', SettingsController]);


function SettingsController($scope, $rootScope, $window, $translate, LogonService, productWebservice, BrowserExtensionService) {

    $translate('SETTINGS_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });

    $scope.$on("updateCredentials", function () {
        "use strict";
        $scope.$apply();
    });

    LogonService.LoadCreadentialsFromRootScope();

    $scope.updateProgramData = function () {
        BrowserExtensionService.runtime.sendMessage({action : 'update-programData'});
        $scope.$parent.sendAlert('Downloading Program Data', 'success');
    };

    $scope.submitLoginData = function () {
        $rootScope.validCredentials = false;

        if (angular.isUndefined($rootScope.credentials.countryPlatform)) {
            $scope.$parent.sendAlert('Please select a country platform', 'danger');
            return
        }
        LogonService.RemoveToken();



        LogonService.CheckCredentials($rootScope.credentials).then(function (response) {

            if (angular.isDefined(response.data.Envelope.Body.Fault)) {
                // wrong publisher webservice credentials
                $scope.$parent.sendAlert('Incorrect Publisher Webservice Password', 'danger');
                $rootScope.$broadcast('updateCredentials');
                $rootScope.credentialsLoaded = true;
                $rootScope.validCredentials = false;
                $rootScope.credentials.webservicePassword = '';

                BrowserExtensionService.runtime.sendMessage({
                    action: 'clear-cache',
                    from: 'settings-ctrl'
                }, function(response){
                    console.log(response)
                });

            } else {



                $rootScope.credentialsLoaded = true;
                $rootScope.validCredentials = true;
                BrowserExtensionService.runtime.sendMessage({
                    action: 'clear-cache',
                    from: 'settings-ctrl'
                }, function(response){
                    console.log(response)
                });
                $rootScope.credentials.publisherId = $rootScope.credentials.publisherId.trim();
                $rootScope.credentials.webservicePassword = $rootScope.credentials.webservicePassword.trim();
                $rootScope.credentials.productWebservicePassword = $rootScope.credentials.productWebservicePassword.trim();
                BrowserExtensionService.runtime.sendMessage({
                    action: 'save-credentials',
                    from: 'settings-ctrl',
                    data: $rootScope.credentials
                }, function(response){
                    console.log(response)
                    $rootScope.$broadcast('updateCredentials');
                });
                $window.credentials = angular.copy($rootScope.credentials);


                // check product data webservice password
                productWebservice.CheckLoginData($rootScope.credentials.publisherId, $rootScope.credentials.productWebservicePassword)
                    .then(
                        (result) => {
                            // success
                        },
                        (error) => {
                            $scope.$parent.sendAlert('Please check your  Product Webservice Password', 'danger');
                            $rootScope.credentials.productWebservicePassword = '';
                        })


                $scope.$parent.sendAlert('Login Data saved', 'success');

            }


        }, function error(response) {
            BrowserExtensionService.runtime.sendMessage({
                action: 'clear-cache',
                from: 'settings-ctrl'
            });
            $scope.$parent.sendAlert('Incorrect Login Data', 'danger');
            $rootScope.credentials.webservicePassword = '';
        });


    };


}
