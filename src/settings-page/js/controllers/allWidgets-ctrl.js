angular.module('AffilinetToolbar')
    .controller('AllWidgetsController', ['$scope', '$sce', '$translate', 'LogonService', AllWidgetsController]);

function AllWidgetsController($scope,  $sce, $translate,   LogonService) {



    $scope.loadingFinished = false;
    
    $translate('ALLWIDGETS_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });

    $scope.messages = [];

    $translate('ALLWIDGETS_OldProducts').then(function (text) {
        $scope.messages.ALL_WIDGETS_CLEAR_OLD_PRODUCS = text;
    });

    $scope.allWidgets = [];


    $scope.copySuccess = false;


    $scope.trustAsUrl = function(url) {
        "use strict";
        return $sce.trustAsUrl(url);
    }


    $scope.deletedProductCount = function(widget) {
        "use strict";
        let count = 0;
        widget.products.forEach(
            function(prod) {
                if (prod.deleted === true) {
                    count++;
                }
            }
        );
        return count;
    }

    $scope.clearOldProduct = function(widget) {
        "use strict";
        let newProds = [];
        widget.products.forEach(
            function(prod) {
                if (prod.deleted === false) {
                    newProds.push(prod);
                }
            }
        );
        widget.products =  newProds;
        updateWidget(widget)

        return count;
    }


    let updateWidget = function(widget) {
        LogonService.WidgetUpdate(widget.id, widget).then(function (result) {
            "use strict";
            let changedWidget = result.data;
            let index = $scioe.allWidgets.findIndex(function(widg) { return widg.id === changedWidget.id});
            $scope.allWidgets[index] = changedWidget;
            $scope.$parent.sendAlert($scope.messages.ALLWIDGETS_OldProductsRemoved, 'success')


        }, function (error) {
            "use strict";
            console.error(error);
            $scope.$parent.sendAlert( 'Could not update widget', 'danger')
        });


    };



    $scope.deleteWidget = function() {

        /**
         * delete it serverside, then remove from allWidgets
         */

        if (!confirm($scope.messages.ALL_WIDGETS_SureYouWantToDeleteWidget)) {
            return;
        }

        LogonService.WidgetDelete($scope.widget.id).then(
            function(result) {
                const index = $scope.allWidgets.findIndex((widget) => {return widget.id === $scope.widget.id});
                $scope.selectedWidget = null;
                $scope.widget = angular.copy($scope.defaultWidget);
                $scope.addWatchToWidget();
                $scope.allWidgets.splice(index, 1);
            },
            function(error) {
                $scope.$parent.sendAlert('Could not delete widget. Please check internet connection', 'danger')
            }
        )
    };




    /**
     * Load the widgets
     */

    let init = () => {
        LogonService.WidgetIndex().then(function(response){
            $scope.allWidgets = response.data;
            $scope.loadingFinished = true;

        }, function (error) {
            $scope.$parent.sendAlert('Could not load widgets, please check internet connection', 'danger')
            $scope.loadingFinished = true;
        })
    };

    init()




};
