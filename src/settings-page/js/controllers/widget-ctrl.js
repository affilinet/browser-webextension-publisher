angular.module('AffilinetToolbar')
    .controller('WidgetController', ['$scope', '$sce', '$translate', '$timeout', 'BrowserExtensionService', 'productWebservice', '$stateParams', WidgetController]);

function WidgetController($scope,  $sce, $translate, $timeout, BrowserExtensionService, productWebservice, $stateParams) {

    $scope.loadingFinished = false;
    $translate('WIDGET_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });

    $scope.messages = [];
    $translate('WIDGET_SureYouWantToDeleteWidget').then(function (text) {
        $scope.messages.WIDGET_SureYouWantToDeleteWidget = text;
    });

    $translate('WIDGET_SureYouWantToClearProductsFromWidget').then(function (text) {
        $scope.messages.WIDGET_SureYouWantToClearProductsFromWidget = text;
    });
    $translate('WIDGET_WarningChangesNotSaved').then(function (text) {
        $scope.messages.WIDGET_WarningChangesNotSaved = text;
    });


    $scope.storedProductLists = [];
    $scope.storedWidgets = [];
    $scope.productDetails = [];

    $scope.sliderOffset = 0;
    $scope.widgetCode = '';

    $scope.currentlyDraggedItem = {};


    $scope.selectedWidget = {};

    $scope.sliderIsReady = false;
    $scope.defaultWidget = {
        id : null,
        widgetName : '',
        autoRotate : true,
        price : false,
        name : true,
        shop : false,
        brand : false,
        manufacturer : false,
        type : 'carousel',
        productInfoOnHover : true,
        imageSize : '180',
        products: []
    };
    $scope.widget = angular.copy($scope.defaultWidget);

    $scope.widget.products = $stateParams.productIds;

    $scope.debug = function(event, draggabe) {
        "use strict";
        //debugger;
        console.log(event, draggabe);
    }


    $scope.addWatchToWidget = function() {

        $scope.createWidgetCode();
        $scope.$watch('widget', function(newVal, old) {
            $scope.createWidgetCode();
            console.log('widget changed');
            if (
                old.products.length !== newVal.products.length
                || old.imageSize !== newVal.imageSize

            ) {
                console.log('products, imageSize is not equal: reload slider');
                $scope.refreshSlider();
            }
        }, true);
    };



    $scope.activateDragOnSlick = function() {
        "use strict";
        $(function() {
            $('*[draggable!=true]','.slick-track').unbind('dragstart');
            $( ".affilinet-product-widget-product" ).draggable({
                placeholder: true,
                animate: true,
                onStart : 'startDragProduct',
                revert: true,
                revertDuration: 0,
                appendTo: 'body',
                containment: 'window',
                scroll: false,
                helper: function () {
                    return $(this).clone().appendTo("#widgetContainer").removeClass('slick-slide').show();

                },
            });
        });

        $(".affilinet-product-widget-product").on("draggable mouseenter mousedown",function(event){
            event.stopPropagation();
        });
    };

    $scope.refreshSlider = function () {
        console.log('deactivate slider');

        $scope.sliderIsReady = false; // disable slick
        $timeout(() => {
            $scope.sliderIsReady = true;
            $scope.activateDragOnSlick();
        },100);
    };
    $scope.refreshSlider();

    $scope.saveWidget = function() {
        if ($scope.widget.id !== null) {
            const index = $scope.storedWidgets.findIndex((widget) => {return widget.id === $scope.selectedWidget.id});
            let changedWidget = angular.copy($scope.widget);
            delete changedWidget.$$hashKey;
            $scope.storedWidgets[index] = changedWidget;
            $scope.selectedWidget = changedWidget;
        } else {
            let newWidget = angular.copy($scope.widget);
            delete newWidget.$$hashKey;
            newWidget.id = new Date().getTime();
            $scope.storedWidgets.push(newWidget);
            $scope.widget.id = newWidget.id;
            $scope.selectedWidget = newWidget;
        }
    };

    $scope.currentSlideIndex = 1;
    $scope.slickConfig = {
        enabled: true,
        autoPlay: $scope.autoRotate,
        autoPlaySpeed : 100,
        dots: false,
        arrows: true,
        swipe: true,
        infinite: true,
        method: {},
        respondTo : 'window',
        slidesToShow: 4,
        slidesToScroll: 4,

        event: {
            afterChange: function (event, slick, currentSlide, nextSlide) {
                $scope.currentSlideIndex = currentSlide; // save current index each time
            },
            init: function (event, slick) {
                slick.slickGoTo($scope.currentSlideIndex); // slide to correct index when init
            }
        }
    };

    $scope.trustAsUrl = function(url) {
        "use strict";
        return $sce.trustAsUrl(url);
    }
    $scope.createNewWidget = function() {

        // not saved
        if ($scope.widget.id === null && $scope.widget.products.length > 0) {
            if (!confirm($scope.messages.WIDGET_WarningChangesNotSaved)) {
                return;
            }
        } else {
            // save changes!
            $scope.saveWidget();
        }

        $scope.widget = angular.copy($scope.defaultWidget);
        $scope.widget.id = null;
        $scope.selectedWidget = null;
        $scope.addWatchToWidget();
        $scope.refreshSlider();
    };

    $scope.copyWidget = function() {
        "use strict";
        $scope.widget.widgetName  += ' Copy';
        $scope.widget.id = null
    };

    $scope.deleteWidget = function() {

        if (!confirm($scope.messages.WIDGET_SureYouWantToDeleteWidget)) {
            return;
        }
        "use strict";
        const index = $scope.storedWidgets.findIndex((widget) => {return widget.id === $scope.widget.id});
        console.log(index);
        $scope.selectedWidget = null;
        $scope.widget = angular.copy($scope.defaultWidget);
        $scope.addWatchToWidget();
        $scope.storedWidgets.splice(index, 1);
    };

    $scope.clearProductsFromWidget =  function() {
        "use strict";
        if (confirm($scope.messages.WIDGET_SureYouWantToClearProductsFromWidget)) {
            $scope.widget.products = [];
        }
    }

    $scope.openWidget = function() {
        "use strict";
        console.log('open widget', $scope.selectedWidget);

        const index = $scope.storedWidgets.findIndex((widget) => {return widget.id === $scope.selectedWidget.id});
        $scope.loadProductData($scope.storedWidgets[index].products);
        $scope.widget = angular.copy($scope.storedWidgets[index]);
        $scope.addWatchToWidget();
        $scope.refreshSlider();
    };


    $scope.getWidgetSizeAsArray = function() {

        // more than one empty product at the end? remove them
        let lenght = $scope.widget.products.length;
        for (let i = lenght; i >= 0; i--) {
            if (i !== lenght && $scope.widget.products[i] === null){
                $scope.widget.products.splice(i, 1);
                break;
            }
        }
        let temp = [];
        let size = parseInt($scope.widget.products.length) + 1;
        for(var j = 0; j < size; j++){
            temp.push(j)
        }
        return temp;
    }






    $scope.dropProductOnWidget = function(event,draggable) {
        let targetIndex = +event.target.getAttribute('data-index');

        let draggedItemInfo = {
            from: draggable.helper[0].getAttribute('data-from'),
            productId: draggable.helper[0].getAttribute('data-product-id'),
            index: draggable.helper[0].getAttribute('data-index')
        };
        console.log('DROP ON WIDGET draggedItemInfo', draggedItemInfo);

        if (draggedItemInfo.productId === null || typeof draggedItemInfo.productId === 'undefined') {
            return false;
        }

        const target =  $scope.widget.products[targetIndex];

        if (draggedItemInfo.from === 'widget') {
            // ziel ist leer?
            if (target === undefined || target === null) {
                // überschreibe die null
                $scope.widget.products[targetIndex] = draggedItemInfo.productId;
                // entferne die alte karte
                $scope.widget.products.splice(draggedItemInfo.index, 1);

            } else {
                let temp = $scope.widget.products[targetIndex];
                $scope.widget.products[targetIndex] = draggedItemInfo.productId;
                $scope.widget.products[draggedItemInfo.index] = temp;
            }
        } else {
            if (!target) {
                // überschreibe leere karten
                $scope.widget.products[targetIndex] = draggedItemInfo.productId;
            } else {
                // füge die karte ein
                $scope.widget.products.splice(targetIndex, 0, draggedItemInfo.productId);
            }
        }
        $scope.currentlyDraggedItem = {};
        $scope.refreshSlider();
        return true;
    };

    $scope.dropProductOnTrash = function($event,draggable) {
        // remove the product from widget
        let draggedItemInfo = {
            from: draggable.helper[0].getAttribute('data-from'),
            productId: draggable.helper[0].getAttribute('data-product-id'),
            index: draggable.helper[0].getAttribute('data-index')
        };

        if (draggedItemInfo.from === 'widget') {
            $scope.widget.products.splice(draggedItemInfo.index,1);
            return true;
        }
        return false;
    }

    $scope.deleteProductFromWidget = function(index){
        console.log('deleteProductFromWidget', index);
        $scope.widget.products.splice(index,1);
    }

    $scope.dropProductOnProductList = function($event,data) {
        // remove the product from widget
        if (data.from === 'widget') {
            $scope.widget.products[data.index] = null;
            return true;
        }
        return false;
    };


    attachWatchHandlers = function() {
        $scope.$watch('storedWidgets', function(newVal, oldVal) {
            console.log('save widgets', newVal);
            BrowserExtensionService.storage.local.set({storedWidgets: newVal });
        }, true)
    };


    BrowserExtensionService.storage.local.get(['storedProductLists', 'storedWidgets'], function (res) {
        "use strict";
        if (res.storedProductLists) {
            $scope.storedProductLists = res.storedProductLists;
            if ($scope.storedProductLists[0]) {
                $scope.selectedProductList = $scope.storedProductLists[0];
            }

        }
        if (res.storedWidgets) {
            $scope.storedWidgets = res.storedWidgets;
        }
        attachWatchHandlers();

        let allProductIds = [];
        angular.forEach($scope.storedProductLists, function (productList) {
            productList.products.forEach(function (prodId) {
                allProductIds.push(prodId)
            })
        });

        $scope.loadProductData(allProductIds);

        $scope.loadingFinished = true;
    });

    $scope.loadProductData = function(productIdArray) {
        "use strict";
        let i = 0;
        let batch = 0;
        let productBatches = [];
        angular.forEach(productIdArray, (productId) => {

            if (!productBatches[batch]) {
                productBatches[batch] = [productId];
            } else {
                productBatches[batch].push(productId);
            }
            if (productBatches[batch].length === 50) {
                batch++;
            }
            i++;
        });

        // load the product details from webservice

        angular.forEach(productBatches, function (productIds) {
            productWebservice.GetProducts(productIds).then(
                (response) => {
                    angular.forEach(response.data.Products, (product) => {
                        $scope.productDetails[product.ProductId] = product
                    });
                    $scope.createWidgetCode();
                }
            )
            console.log($scope.productDetails);

        });
    }



    $scope.getWidgetConfig  = function() {
        "use strict";
        let widgetConfig = {
            "autoRotate" : $scope.widget.autoRotate,
            "productInfoOnHover" : $scope.widget.productInfoOnHover,
            "type" : $scope.widget.type,
            "price" : $scope.widget.price,
            "name" : $scope.widget.name,
            "shop" : $scope.widget.shop,
            "brand" : $scope.widget.brand,
            "manufacturer" : $scope.widget.manufacturer,
            "products" : []
        };
        angular.forEach($scope.widget.products, function(productId){
            if ($scope.productDetails[productId]) {
                widgetConfig.products.push(
                    {
                        "url" : $scope.productDetails[productId].Deeplink1,
                        "img" : $scope.productDetails[productId].Images[0][0].URL,
                        "price": $scope.productDetails[productId].PriceInformation.DisplayPrice,
                        "brand": $scope.productDetails[productId].Brand,
                        "name": $scope.productDetails[productId].ProductName,
                        "manufacturer" : $scope.productDetails[productId].Manufacturer,
                        "shop" : $scope.productDetails[productId].ShopTitle,
                    }
                )
            }
        });
        return widgetConfig;
    }


    $scope.createWidgetCode = function() {
        "use strict";

        let widgetConfig = $scope.getWidgetConfig();

        let code = '<div id="affilinet-product-widget-' + $scope.widget.id + '"' +
        ' class="affilinet-product-widget"' +
        ' data-affilinet-widget-id="' + $scope.widget.id +'"' +
        ' data-config=\''+  JSON.stringify(widgetConfig) +'\'>' +
        '<sty' + 'le type="text/css">@import "https://productwidget.com/style.css";</style>' +
        '<scr' + 'ipt type="text/javascript">' +
        '!function(d){var e,i = \'affilinet-product-widget-script\';if(!d.getElementById(i)){' +
        'e = d.createElement(\'script\');' +
        'e.id = i;' +
        'e.src = \'https://productwidget.com/affilinet-product-widget-min.js\';' +
        'd.body.appendChild(e);}' +
        'if (typeof window.__affilinetWidget===\'object\')if (d.readyState===\'complete\'){' +
        'window.__affilinetWidget.init();}}(document);</scr' + 'ipt></div>'

        $scope.widgetCode = code;

    }


    /***
     * Inititalizing functions
     */



    if ($stateParams.productIds.length > 0) {
        $scope.loadProductData($stateParams.productIds);
    }

    $scope.addWatchToWidget();




};
