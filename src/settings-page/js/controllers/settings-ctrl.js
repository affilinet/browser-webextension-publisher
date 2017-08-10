angular.module('AffilinetToolbar')
    .controller('SettingsController', ['$scope', '$rootScope', '$window', '$translate', 'LogonService', 'BrowserExtensionService', SettingsController]);


function SettingsController($scope, $rootScope, $window, $translate, LogonService, BrowserExtensionService) {

    $translate('SETTINGS_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });


    $scope.$on("updateCredentials", function () {
        "use strict";
        $scope.$apply();
    });

    LogonService.LoadCreadentialsFromRootScope();

    $scope.submitLoginData = function () {
        $rootScope.validCredentials = false;
        console.log($rootScope.credentials.countryPlatform);

        if (angular.isUndefined($rootScope.credentials.countryPlatform)) {
            $scope.$parent.sendAlert('Please select a country platform', 'danger');
            return
        }
        LogonService.RemoveToken();

        LogonService.CheckCredentials($rootScope.credentials).then(function (response) {
            "use strict";

            if (angular.isDefined(response.data.Envelope.Body.Fault)) {
                // wrong credentials
                $scope.$parent.sendAlert('Incorrect Login Data', 'danger');
                $rootScope.$broadcast('updateCredentials');
                $rootScope.credentialsLoaded = true;
                $rootScope.validCredentials = false;
                $rootScope.credentials = {publisherId: '', webservicePassword: ''};
                BrowserExtensionService.runtime.sendMessage({
                    action: 'clear-cache',
                    from: 'settings-ctrl'
                });

            } else {
                $rootScope.$broadcast('updateCredentials');
                $rootScope.credentialsLoaded = true;
                $rootScope.validCredentials = true;
                BrowserExtensionService.runtime.sendMessage({
                    action: 'clear-cache',
                    from: 'settings-ctrl'
                });
                $rootScope.credentials.publisherId = $rootScope.credentials.publisherId.trim();
                $rootScope.credentials.webservicePassword = $rootScope.credentials.webservicePassword.trim();
                BrowserExtensionService.runtime.sendMessage({
                    action: 'save-credentials',
                    from: 'settings-ctrl',
                    data: $rootScope.credentials
                });
                $window.credentials = angular.copy($rootScope.credentials);
                $scope.$parent.sendAlert('Login Data saved', 'success');

            }


        }, function error(response) {
            BrowserExtensionService.runtime.sendMessage({
                action: 'clear-cache',
                from: 'settings-ctrl'
            });
            $scope.$parent.sendAlert('Incorrect Login Data', 'danger');
            $rootScope.credentials = {publisherId: '', webservicePassword: '', countryPlatform : ''};
        });


    };


}
