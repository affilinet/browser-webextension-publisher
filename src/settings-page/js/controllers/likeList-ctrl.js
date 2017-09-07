angular.module('AffilinetToolbar')
    .controller('LikeListController', ['$scope', '$translate', 'BrowserExtensionService', 'productWebservice', '$location',   LikeListController]);

function LikeListController($scope,  $translate, BrowserExtensionService, productWebservice,  $location) {
    $scope.loadingFinished = false;

    let searchParams = $location.search();
    if (searchParams.tab) {
        $scope.activeTabIndex = +searchParams.tab
    } else {
        $scope.activeTabIndex = 0;
    }

    $translate('LIKELIST_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });
    $scope.messages = [];
    $translate('LIKELIST_ListNamesMustBeUnique').then(function (text) {
        $scope.messages.LIKELIST_ListNamesMustBeUnique = text;
    });
    $translate('LIKELIST_SureYouWantToDeleteProduct').then(function (text) {
        $scope.messages.LIKELIST_SureYouWantToDeleteProduct = text;
    });

    $translate('LIKELIST_SureYouWantToDeleteLike').then(function (text) {
        $scope.messages.LIKELIST_SureYouWantToDeleteLike = text;
    });
    $translate('LIKELIST_SureYouWantToDeleteProductList').then(function (text) {
        $scope.messages.LIKELIST_SureYouWantToDeleteProductList = text;
    });

    $scope.likeList = [];
    $scope.storedProductLists = [];
    $scope.productDetails = [];
    $scope.selectedProducts = [];
    $scope.selectedProductIds = [];

    $scope.newProductListKey = null;

    $scope.likeImageCount = 0;
    $scope.likeWebsiteCount = 0;
    $scope.productMenuPopoverTemplate = 'productMenuPopoverTemplate.html';
    $scope.pinMenuPopoverTemplate = 'pinMenuPopoverTemplate.html';


    $scope.shareOn = function(socialNetworkName, productId) {
        "use strict";
        BrowserExtensionService.runtime.sendMessage({
            action: "share-on-" + socialNetworkName,
            data : getShareDetails(productId)
        });
    };

    $scope.shareLikeOn = function(socialNetworkName, like) {
        "use strict";
        BrowserExtensionService.runtime.sendMessage({
            action: "share-on-" + socialNetworkName,
            data : like
        });
    };
    $scope.copyDeeplink = function(like) {

        $scope.$parent.sendAlert('Deeplink copied', 'success');
        BrowserExtensionService.runtime.sendMessage({
            action: "copyDeeplink",
            data : like
        }, function(resposne) {
        });
    };
    $scope.copyImageCode = function(like) {
        $scope.$parent.sendAlert('Image Code  copied', 'success');
        BrowserExtensionService.runtime.sendMessage({
            action: "copyImageCode",
            data : like
        }, function(resposne) {

        });
    };
    $scope.copyDeeplinkForProduct = function(productId) {
        $scope.$parent.sendAlert('Deeplink copied', 'success');
        BrowserExtensionService.runtime.sendMessage({
            action: "copyDeeplink",
            data : getShareDetails(productId)
        }, function(resposne) {
        });
    };
    $scope.copyImageCodeForProduct = function(productId){
        "use strict";
        $scope.$parent.sendAlert('Image Code  copied', 'success');
        BrowserExtensionService.runtime.sendMessage({
            action: "copyImageCode",
            data : getShareDetails(productId)
        }, function(resposne) {

        });
    };
    function getShareDetails(productId) {
        const productDetails = $scope.productDetails[productId];
        return {
            image : {
                src  : productDetails.Images[0][0].URL,
                width : productDetails.Images[0][0].Width,
                height : productDetails.Images[0][0].Height,
                alt : productDetails.ProductName,
                title : productDetails.ProductName,
            },
            uri: productDetails.Deeplink1,
            pageTitle: productDetails.ProductName
        };
    }

    $scope.selectedNewListForProduct = function(productId, fromList, toList, productKey) {
        "use strict";
        console.log('selected new list for product', productId, fromList,  toList);
        $scope.storedProductLists[toList].products.push(productId);
        $scope.storedProductLists[fromList].products.splice(productKey, 1);
        $scope.newProductListKey = null;
    };

    $scope.checkProductListName = function (name, list) {
        console.log(name, list);
        if (name === list.name) {
            return true;
        }
        const foundIndex = $scope.storedProductLists.findIndex((productList) => {
            return productList.name === name;
        });
        if (foundIndex >= 0) {
            alert($scope.messages.LIKELIST_ListNamesMustBeUnique);
            return false
        }
        return true;
    };

    $scope.createProductList = function (name) {

        console.log('create product list', name);
        if (name === undefined) {
            return false;
        }
        const foundIndex = $scope.storedProductLists.findIndex((productList) => {
            return productList.name === name;
        });
        if (foundIndex >= 0) {
            alert($scope.messages.LIKELIST_ListNamesMustBeUnique);
            return false
        }
        let id = new Date().getTime() + '-' + Math.random();
        let newItem = {name: name, products : [], id: id};
        $scope.storedProductLists.unshift(newItem);
        return false;
    };


    attachWatchHandlers = function() {
        console.log('attach watch handler');
        $scope.$watch('storedProductLists', function(newVal, oldVal) {
            console.log('changed storedProductLists', newVal, oldVal);
            BrowserExtensionService.storage.local.set({storedProductLists: newVal });
        }, true)
        $scope.$watch('likeList', function(newVal, oldVal) {
            console.log('changed likeList', newVal, oldVal);
            $scope.likeImageCount = 0;
            $scope.likeWebsiteCount = 0;
            angular.forEach(newVal, (like) => {
                if(like.type === 'image') {
                    $scope.likeImageCount++
                } else {
                    $scope.likeWebsiteCount++;
                }
            });
            BrowserExtensionService.storage.local.set({likeList: newVal });
        }, true)
    };


    $scope.deleteProduct = function(event, productKey, listKey) {
        event.preventDefault();
        event.stopPropagation();
        if (confirm($scope.messages.LIKELIST_SureYouWantToDeleteProduct)) {
            $scope.storedProductLists[listKey].products.splice(productKey, 1);
        }

    };
    $scope.deleteProductList = function(listKey) {
        event.preventDefault();
        event.stopPropagation();
        event.stopPropagation();
        if (confirm($scope.messages.LIKELIST_SureYouWantToDeleteProductList)) {
            $scope.storedProductLists.splice(listKey, 1);
        }

    };

    $scope.deleteLike = function(likeKey) {
        "use strict";
        event.preventDefault();
        event.stopPropagation();
        if (confirm($scope.messages.LIKELIST_SureYouWantToDeleteLike)) {
            $scope.likeList.splice(likeKey, 1);
        }
    }

    $scope.toggleSelectProduct = function(event, productId) {
        console.log(productId);
        event.preventDefault();
        event.stopPropagation();
        console.log(event);
        if ($scope.selectedProductIds.includes(productId)) {
            $scope.selectedProducts = $scope.selectedProducts
                .filter( (prod) => prod.ProductId !== productId);

            $scope.selectedProductIds = $scope.selectedProductIds
                .filter( (prodId) => prodId !== productId);

        } else {
            if ($scope.productDetails[productId]) {
                $scope.selectedProducts.push($scope.productDetails[productId]);
                $scope.selectedProductIds.push(productId);
            }

        }
    };

    BrowserExtensionService.storage.local.get(['likeList', 'storedProductLists'], function (res) {
        console.log('loading likelist');
        "use strict";
        if (res.likeList) {
            $scope.likeList = res.likeList;
        }
        if (res.storedProductLists) {
            $scope.storedProductLists = res.storedProductLists;
        }
        attachWatchHandlers();

        let allProductIds = [];
        angular.forEach($scope.storedProductLists, function (productList) {
            productList.products.forEach(function (prodId) {
                allProductIds.push(prodId)
            })
        });

        let i = 0;
        let batch = 0;
        let productBatches = [];
        angular.forEach(allProductIds, (productId) => {

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
                }
            )
        });
        console.log($scope.productDetails);
        $scope.loadingFinished = true;
    });

};
