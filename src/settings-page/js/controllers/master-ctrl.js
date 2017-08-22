/**
 * Master Controller
 */

angular.module('AffilinetToolbar')
    .controller('MasterCtrl', ['$scope', '$rootScope', 'BrowserExtensionService', MasterCtrl]);

function MasterCtrl($scope, $rootScope, BrowserExtensionService) {

    $rootScope.credentials = {};
    $rootScope.credentialsLoaded = false;
    $rootScope.validCredentials = false;


    var checkIfCredentialObjectIsSet = function () {
        BrowserExtensionService.storage.local.get(['publisherId', 'webservicePassword', 'countryPlatform', 'disableImageContextMenu', 'productWebservicePassword'], function(result) {
            "use strict";
            if (result.webservicePassword && result.publisherId && result.countryPlatform) {
                $rootScope.credentials = result;
                clearInterval(refreshIntervalId);
                $rootScope.$broadcast('updateCredentials');
                $rootScope.credentialsLoaded = true;
                $rootScope.validCredentials = true;
            } else {
                clearInterval(refreshIntervalId);
                $rootScope.$broadcast('updateCredentials');
                $rootScope.credentialsLoaded = true;
                $rootScope.validCredentials = false;
            }
        })

    };
    var refreshIntervalId = null;
    refreshIntervalId = setInterval(checkIfCredentialObjectIsSet, 50);


    $scope.sendAlert = function (message, type) {
        $scope.alerts.push({
            msg: message,
            type: type
        });
        setTimeout(function () {
            $scope.closeAlert($scope.alerts.length - 1);
        }, 2500);
    };
    $scope.alerts = [];

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    $scope.pageName = 'Dashboard';
    $scope.toggle = true;

    $scope.getWidth = function () {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function (newValue, oldValue) {
        $scope.toggle = newValue >= mobileView;

    });


    $scope.toggleSidebar = function () {
        $scope.toggle = !$scope.toggle;
    };

    window.onresize = function () {
        $scope.$apply();
    };


}

angular.module('AffilinetToolbar').filter('currentyear', ['$filter', function ($filter) {
    return function () {
        return $filter('date')(new Date(), 'yyyy');
    };
}]);