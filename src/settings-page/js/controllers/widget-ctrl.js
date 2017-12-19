angular.module('AffilinetToolbar')
    .controller('WidgetController', ['$scope',  '$sce', '$translate', '$timeout', 'BrowserExtensionService', 'productWebservice', '$stateParams', 'LogonService', WidgetController]);

function WidgetController($scope, $sce, $translate, $timeout, BrowserExtensionService, productWebservice, $stateParams,  LogonService) {


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
    $translate('WIDGET_WidgetCreated').then(function (text) {
        $scope.messages.WIDGET_WidgetCreated = text;
    });
    $translate('WIDGET_WidgetSaved').then(function (text) {
        $scope.messages.WIDGET_WidgetSaved = text;
    });


    $scope.storedProductLists = [];
    /**
     * @deprecated
     * @type {Array}
     */
    $scope.storedWidgets = [];
    $scope.migrationStarted = false;

    /**
     * widgets from server
     * @type {Array}
     */
    $scope.allWidgets = [];


    $scope.productDetails = [];

    $scope.sliderOffset = 0;
    $scope.widgetCode = '';

    $scope.currentlyDraggedItem = {};

    let programUrlsRequested = [];
    let programUrls = [];

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
    $scope.widget.products = [];


    $scope.copySuccess = false;


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

    $scope.addWatchToWidget = function() {

        $scope.createWidgetCode();
        $scope.$watch('widget', function(newVal, old) {
            $scope.createWidgetCode();
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
            const index = $scope.allWidgets.findIndex((widget) => {return widget.id === $scope.widget.id});
            LogonService.WidgetUpdate($scope.widget.id, $scope.widget).then(function (result) {
                "use strict";
                let changedWidget = result.data;
                $scope.allWidgets[index] = changedWidget;
                $scope.selectedWidget = changedWidget;
                $scope.$parent.sendAlert($scope.messages.WIDGET_WidgetSaved, 'success')


            }, function (error) {
                "use strict";
                console.error(error);
                $scope.$parent.sendAlert( 'Could not save widget', 'danger')
            });


        } else {

            LogonService.WidgetCreate($scope.widget).then(function (result) {
                "use strict";
                let newWidget = result.data;
                // put it to the end
                $scope.allWidgets.unshift(newWidget);
                $scope.widget.id = newWidget.id;
                $scope.selectedWidget = newWidget;
                $scope.$parent.sendAlert($scope.messages.WIDGET_WidgetCreated, 'success')

            }, function (error) {
                "use strict";
                console.error(error);
                $scope.$parent.sendAlert( 'Could not save widget', 'danger')
            });

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
            if( $scope.widget.widgetName !== '') {
                $scope.saveWidget();
            }
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

        /**
         * delete it serverside, then remove from allWidgets
         */

        if (!confirm($scope.messages.WIDGET_SureYouWantToDeleteWidget)) {
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

    $scope.clearProductsFromWidget =  function() {
        "use strict";
        if (confirm($scope.messages.WIDGET_SureYouWantToClearProductsFromWidget)) {
            $scope.widget.products = [];
        }
    }

    $scope.openWidget = function() {
        "use strict";
        console.log('open widget', $scope.selectedWidget);

        if ($scope.selectedWidget && $scope.selectedWidget.id) {
            const index = $scope.allWidgets.findIndex((widget) => {return widget.id === $scope.selectedWidget.id});
            $scope.widget = angular.copy($scope.allWidgets[index]);
            $scope.addWatchToWidget();
            $scope.refreshSlider();
        }

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
            index: draggable.helper[0].getAttribute('data-index'),
            targetIndex: targetIndex
        };
        console.log('DROP ON WIDGET draggedItemInfo', draggedItemInfo);

        if (draggedItemInfo.productId === null || typeof draggedItemInfo.productId === 'undefined') {
            return false;
        }

        const tartgetProduct =  $scope.widget.products[targetIndex];
        console.log('tartgetProduct product')

        if (draggedItemInfo.from === 'widget') {
            // ziel ist leer?
            if (tartgetProduct === undefined || tartgetProduct === null) {
                // überschreibe die null
                $scope.widget.products[targetIndex] =   $scope.getProductDetail(draggedItemInfo.productId);
                // entferne die alte karte
                $scope.widget.products.splice(draggedItemInfo.index, 1);

            } else {
                // tausche die karten
                let temp = $scope.widget.products[targetIndex];
                $scope.widget.products[targetIndex] =  $scope.getProductDetail(draggedItemInfo.productId);
                $scope.widget.products[draggedItemInfo.index] = temp;
            }
        } else {
            if (tartgetProduct === undefined || tartgetProduct === null) {
                // überschreibe leere karten
                $scope.widget.products[targetIndex] = $scope.getProductDetail(draggedItemInfo.productId);
            } else {
                // füge die karte ein
                $scope.widget.products.splice(targetIndex, 0,  $scope.getProductDetail(draggedItemInfo.productId));
            }
        }
        $scope.currentlyDraggedItem = {};
        $scope.refreshSlider();
        return true;
    };


    let storeProductDetail = function (ApiProduct, addToWidget = false) {

        if (programUrlsRequested[ApiProduct.ProgramId] !== true ) {
            programUrlsRequested[ApiProduct.ProgramId] = true;
            BrowserExtensionService.runtime.sendMessage({action : 'get-programDetailsForProgramId', data : { programId : ApiProduct.ProgramId}},
                function(programDetails){
                    console.log('received details', programDetails);
                    if (programDetails !== false) {
                            programUrls[ApiProduct.ProgramId] = programDetails.programUrl;
                            $scope.productDetails[ApiProduct.ProductId] = {
                                    "id": ApiProduct.ProductId,
                                    "url": ApiProduct.Deeplink1,
                                    "img": ApiProduct.Images[0][0].URL,
                                    "price": ApiProduct.PriceInformation.DisplayPrice,
                                    "brand": ApiProduct.Brand,
                                    "name": ApiProduct.ProductName,
                                    "manufacturer": ApiProduct.Manufacturer,
                                    "shop": programDetails.programUrl,
                                    "deleted": false
                                }

                                if (addToWidget) {
                                    $scope.widget.products.push($scope.productDetails[ApiProduct.ProductId])
                                }
                    }
                })
        }
        else {
            console.log('store details')

                $scope.productDetails[ApiProduct.ProductId] = {
                        "id": ApiProduct.ProductId,
                        "url": ApiProduct.Deeplink1,
                        "img": ApiProduct.Images[0][0].URL,
                        "price": ApiProduct.PriceInformation.DisplayPrice,
                        "brand": ApiProduct.Brand,
                        "name": ApiProduct.ProductName,
                        "manufacturer": ApiProduct.Manufacturer,
                        "shop": programUrls[ApiProduct.ProgramId],
                        "deleted": false
                    }
            if (addToWidget) {
                $scope.widget.products.push($scope.productDetails[ApiProduct.ProductId])
            }
        }

    }

    $scope.getProductDetail = function(productId) {
        let productDetails = $scope.productDetails[productId];



        if (typeof productDetails === 'undefined') {
            console.log('getProductDetail is null ',productId)
            return null;
        }
        return productDetails

    }

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


    $scope.loadProductData = function(productIdArray, addToWidget = false) {
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
                    angular.forEach(response.data.Products, (ApiProduct) => {
                        storeProductDetail(ApiProduct, addToWidget)

                    });
                    $scope.createWidgetCode();
                }
            )

        });

    };




    $scope.createWidgetCode = function() {
        "use strict";

        let code = '<div id="affilinet-product-widget-' + $scope.widget.id + '"' +
        ' class="affilinet-product-widget"' +
        ' data-affilinet-widget-id="' + $scope.widget.id + '">' +
        '<sty' + 'le type="text/css">@import "https://productwidget.com/style-1.0.0.css";</style>' +
        '<scr' + 'ipt type="text/javascript">' +
        '!function(d){var e,i = \'affilinet-product-widget-script\';if(!d.getElementById(i)){' +
        'e = d.createElement(\'script\');' +
        'e.id = i;' +
        'e.src = \'https://productwidget.com/affilinet-product-widget-1.0.0-min.js\';' +
        'd.body.appendChild(e);}' +
        'if (typeof window.__affilinetWidget===\'object\')if (d.readyState===\'complete\'){' +
        'window.__affilinetWidget.init();}}(document);</scr' + 'ipt></div>'

        $scope.widgetCode = code;

    }



    $scope.copiedCode = function () {
        $scope.copySuccess = true;
        $timeout(function(){
            $scope.copySuccess = false;
        }, 2000);
    }



    /**
     * convert old stored widgets to server side saved widgets.
     * This ugly code is to be removed in the next versions when all old widgets are converted
     */
    migrateOldWidgets = function() {

        BrowserExtensionService.storage.local.get(['storedWidgets'], function (res) {

            if (res.storedWidgets && $scope.migrationStarted === false) {
                $scope.migrationStarted = true;
                console.log('LEGACY widgets existing', res.storedWidgets);

                let legacyProductIds = [];
                res.storedWidgets.forEach(function(legacyWidget){
                    legacyWidget.products.forEach(function (productId) {
                        if (typeof productId === 'string' || typeof productId === 'number') {
                            legacyProductIds.push(productId);
                        }
                    });
                });
                console.log(legacyProductIds);


                let batch = 0;
                let productBatches = [];
                angular.forEach(legacyProductIds, (productId) => {

                    if (!productBatches[batch]) {
                        productBatches[batch] = [productId];
                    } else {
                        productBatches[batch].push(productId);
                    }
                    if (productBatches[batch].length === 50) {
                        batch++;
                    }
                });

                // load the product details from webservice
                let fetchedBatches = 0;



                angular.forEach(productBatches,  (productIds) => {
                    console.log('handling batch', fetchedBatches)

                        productWebservice.GetProducts(productIds).then(
                            (response) => {
                                angular.forEach(response.data.Products, (product) => {
                                    storeProductDetail(product);
                                });


                                if (fetchedBatches === productBatches.length) {
                                    console.log('finished loading legacy widget products, batches: ', fetchedBatches )

                                    window.setTimeout((res) => {
                                        res.storedWidgets.forEach((legacyWidget) => {

                                            let convertedWidget = legacyWidget;

                                            // geth das????
                                            let products = [];
                                            convertedWidget.products.forEach((productId) =>{
                                                let product = $scope.getProductDetail(productId);
                                                if (product !== null) {
                                                    products.push(product)
                                                }else {
                                                    console.error('product not found', productId)

                                                }
                                            });
                                            convertedWidget.products = products;
                                            console.log('converting widget', convertedWidget);

                                            LogonService.WidgetCreate(convertedWidget).then(function (result) {
                                                "use strict";
                                                let newWidget = result.data;
                                                // put it to the end of allwidgets
                                                $scope.allWidgets.unshift(newWidget);
                                                $scope.$parent.sendAlert('Migrated widget', 'success');

                                                // remove it from storedWidgets
                                                const index = $scope.storedWidgets.findIndex((widget) => {
                                                    return widget.id === legacyWidget.id
                                                });
                                                $scope.storedWidgets.splice(index, 1);

                                                // remove it from browserextension storage
                                                BrowserExtensionService.storage.local.set({storedWidgets: $scope.storedWidgets});

                                            }, function (error) {


                                                // remove it from storedWidgets
                                                const index = $scope.storedWidgets.findIndex((widget) => {
                                                    return widget.id === legacyWidget.id
                                                });
                                                $scope.storedWidgets.splice(index, 1);

                                                // remove it from browserextension storage
                                                BrowserExtensionService.storage.local.set({storedWidgets: $scope.storedWidgets});
                                                console.error(error)
                                            });


                                        });
                                    },2000, res)

                                }
                            }
                        );
                        fetchedBatches++;

                })





            }
        });
    }



    /***
     * Inititalizing functions
     */



    if ($stateParams.productIds.length > 0) {
        $scope.loadProductData($stateParams.productIds, true);
    }



    $scope.addWatchToWidget();


    /**
     * Load the widgets
     */

    BrowserExtensionService.storage.local.get(['storedProductLists'], function (res) {


        if (res.storedProductLists) {
            $scope.storedProductLists = res.storedProductLists;
            if ($scope.storedProductLists[0]) {
                $scope.selectedProductList = $scope.storedProductLists[0];
            }
        }


        let allProductIds = [];
        angular.forEach($scope.storedProductLists, function (productList) {
            productList.products.forEach(function (prodId) {
                allProductIds.push(prodId)
            })
        });

        if ($stateParams.productIds.length === 0) {

            $stateParams.productIds.forEach(function (prodId) {
                allProductIds.push(prodId)
            })
        }


        $scope.loadProductData(allProductIds);



        LogonService.WidgetIndex().then(function(response){
            $scope.allWidgets = response.data;
            if ($scope.allWidgets.length > 0) {
                $scope.selectedWidget =  $scope.allWidgets[0]
                console.log('loaded widget', $scope.selectedWidget)

                if ($stateParams.widgetId !== null) {
                    // user wants to load a widget
                    const widgetIndex = $scope.allWidgets.findIndex(function(widg) { return widg.id === $stateParams.widgetId})
                    $scope.selectedWidget = $scope.allWidgets[widgetIndex];
                    $scope.openWidget()
                }
                else if ($stateParams.productIds.length === 0) {
                    $scope.selectedWidget = $scope.allWidgets[0];
                    $scope.openWidget()
                }

            }

        }, function (error) {
            $scope.$parent.sendAlert('Could not load widgets, please check internet connection', 'danger')
        })

        $scope.loadingFinished = true;

       // migrateOldWidgets()
    });





};
