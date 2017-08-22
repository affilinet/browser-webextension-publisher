angular.module('AffilinetToolbar')
    .controller('SearchDiscoverController', ['$scope', '$rootScope', 'LogonService', '$timeout', '$translate', 'productWebservice' ,  'BrowserExtensionService',  SearchDiscoverController]);

function SearchDiscoverController($scope, $rootScope, LogonService, $timeout,  $translate, productWebservice,  BrowserExtensionService) {
    $scope.loadingFinished = false;
    $translate('SEARCHDISCOVER_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });

    $scope.loadingFinished = true;


    $scope.searchFinsihed = false;
    $scope.searching = false;
    $scope.myPrograms = [];
    $scope.allMyProgramIds = [];
    $scope.selectedProgramsIds = [];
    $scope.allShops = [];
    $scope.productDetails = [];
    $scope.allShopsLoading = false;
    $scope.showSuccessMessage = false;
    $scope.shopsFilteredToSelectedPrograms = [];




    $scope.searchDiscoverShowDetails = {};

    $scope.search = '';
    $scope.selectedPrograms = [];
    $scope.selectedShops = [];

    $scope.shopCategories = [];
    $scope.shopCategoriesLoading = false;

    $scope.selectedAffilinetCategories = [];
    $scope.selectedShopCategories = [];

    $scope.productResult = [];
    $scope.productPage = 1;

    $scope.selectedProductIds = [];
    $scope.totalRecords = 0;
    $scope.totalPages = 0;


    $scope.selectedProductList = null;

    BrowserExtensionService.storage.local.get(
        ['storedProductLists',
            'searchDiscoverShowDetails',
            'searchDiscoverLastKeyword',
            'searchDiscoverSelectedShopCategories',
            'searchDiscoverSelectedShops',
            'searchDiscoverSelectedPrograms',
            'searchDiscoverSelectedProgramIds',
            'searchDiscoverSelectedProductIds',
            'searchDiscoverShopsFilteredToSelectedPrograms',
            'searchDiscoverShopsMinPrice',
            'searchDiscoverShopsMaxPrice',
        ]
        , function(result) {
            if (result.storedProductLists) {
                $scope.storedProductLists = result.storedProductLists;
            } else {
                $scope.storedProductLists = [];
            }
            if (result.searchDiscoverShowDetails) {
                $scope.searchDiscoverShowDetails = result.searchDiscoverShowDetails;
            }
            if (result.searchDiscoverLastKeyword) {
                $scope.search = result.searchDiscoverLastKeyword;
            }
            if (result.searchDiscoverSelectedShopCategories) {
                $scope.selectedShopCategories = result.searchDiscoverSelectedShopCategories;
            }
            if (result.searchDiscoverSelectedShops) {
                $scope.selectedShops = result.searchDiscoverSelectedShops;
            }

            if (result.searchDiscoverSelectedProgramIds) {
                $scope.selectedProgramsIds = result.searchDiscoverSelectedProgramIds;
            }
            if (result.searchDiscoverSelectedPrograms) {
                $scope.selectedPrograms = result.searchDiscoverSelectedPrograms;
            }
            if (result.searchDiscoverSelectedProductIds) {
                $scope.selectedProductIds = result.searchDiscoverSelectedProductIds;
                console.log('selected product ids', $scope.selectedProductIds);

                if ($scope.selectedProductIds.length > 0 )
                productWebservice.GetProducts($scope.selectedProductIds).then(
                    (response) => {
                        console.log(response.data.Products);
                        response.data.Products.forEach((product) => {
                            $scope.productDetails[product.ProductId] = product;
                        })

                    }
                )
            }

            if (result.searchDiscoverShopsFilteredToSelectedPrograms) {
                $scope.shopsFilteredToSelectedPrograms = result.searchDiscoverShopsFilteredToSelectedPrograms;
            }
            if (result.searchDiscoverShopsMinPrice) {
                $scope.minPrice = result.searchDiscoverShopsMinPrice;
            } else {
                $scope.minPrice = 0
            }
            if (result.searchDiscoverShopsMaxPrice) {
                $scope.maxPrice = result.searchDiscoverShopsMaxPrice;
            } else {
                $scope.maxPrice = 2000;
            }
            $scope.priceSlider = {
                minValue: $scope.minPrice,
                maxValue: $scope.maxPrice,
                options: {
                    floor: 0,
                    ceil: 2000,
                    pushRange: true,
                    onEnd: function(modelValue,min, max) {
                        console.log(modelValue,min, max)
                        $scope.searchIfValid();
                        BrowserExtensionService.storage.local.set({
                            searchDiscoverShopsMinPrice : min,
                            searchDiscoverShopsMaxPrice : max
                        })
                    }
                }
            };

        });



    $scope.$watch( 'searchDiscoverShowDetails', (searchDiscoverShowDetails)  => {
            BrowserExtensionService.storage.local.set({searchDiscoverShowDetails : searchDiscoverShowDetails})
        }, true
    );

    $scope.$watch( 'selectedProgramIds', (selectedProgramIds)  => {
            BrowserExtensionService.storage.local.set({searchDiscoverSelectedProgramIds : selectedProgramIds})
        }, true
    );
    $scope.$watch( 'selectedPrograms', (selectedPrograms)  => {
            BrowserExtensionService.storage.local.set({searchDiscoverSelectedPrograms : selectedPrograms})
        }, true
    );

    $scope.$watch( 'selectedProductIds', (selectedProductIss)  => {
            BrowserExtensionService.storage.local.set({searchDiscoverSelectedProductIds : selectedProductIss})
        }, true
    );


    $scope.$watch('shopsFilteredToSelectedPrograms', (shopsFilteredToSelectedPrograms) => {
        BrowserExtensionService.storage.local.set({searchDiscoverShopsFilteredToSelectedPrograms : shopsFilteredToSelectedPrograms})
    },true);


    $scope.$watch( 'selectedPrograms',
        (selectedPrograms)  => {
            if (selectedPrograms.length === 0) {
                $scope.shopsFilteredToSelectedPrograms = $scope.allShops;
                $scope.selectedProgramsIds = $scope.allMyProgramIds;
                $scope.selectedShops = [];
            } else {
                $scope.selectedProgramsIds = [];
                selectedPrograms.forEach((program) => {
                    "use strict";
                    $scope.selectedProgramsIds.push(program.programId)
                });
                $scope.shopsFilteredToSelectedPrograms = [];
                $scope.allShopsLoading = true;
                $scope.allShops.forEach((shop) => {
                    "use strict";

                    if ($scope.selectedProgramsIds.indexOf(shop.ProgramId.toString()) >= 0) {
                        $scope.shopsFilteredToSelectedPrograms.push(shop);
                    }
                })
                $scope.allShopsLoading = false;
                $scope.searchIfValid();
            }
        }
    );

    let searchChangedTimeoutPromise;
    $scope.searchIfValid = function() {
        "use strict";
        $timeout.cancel(searchChangedTimeoutPromise);  //does nothing, if timeout already done
        if ($scope.search === '' && $scope.selectedShopCategories.length === 0) {
            return
        }
        searchChangedTimeoutPromise = $timeout(function(){   //Set timeout
            $scope.searching = true;
            $scope.searchProducts();
        },500);


    }

    $scope.$watch('selectedShops', (selectedShops) => {

        BrowserExtensionService.storage.local.set({searchDiscoverSelectedShops : selectedShops});
        if (selectedShops.length !== 1 ) {
            $scope.selectedShopCategories = [];
        }

        if (selectedShops.length === 1) {
            $scope.shopCategoriesLoading = true;
            productWebservice.GetCategoryList(selectedShops[0].ShopId).then(
                (result) => {
                    console.log('GetCategoryList list fetched', result);
                    $scope.shopCategories = result.data.Categories;
                    $scope.shopCategoriesLoading = false;
                }
            )
        }
        $scope.searchIfValid();

    });
    $scope.$watch('selectedShopCategories', function(shopCategories){
        BrowserExtensionService.storage.local.set({searchDiscoverSelectedShopCategories : shopCategories});
        $scope.searchIfValid();
    });

    $scope.$watch('search', (search)=> {
        BrowserExtensionService.storage.local.set({searchDiscoverLastKeyword : search});
        $scope.searchIfValid();
    })

    BrowserExtensionService.storage.local.get('myPrograms', function(result) {
        "use strict";
        if (result.myPrograms ) {
            console.log('myPrograms', result.myPrograms);
            $scope.myPrograms = result.myPrograms;
            $scope.selectedProgramsIds = [];
            result.myPrograms.forEach((program) => {
                $scope.selectedProgramsIds.push(program.programId);
                $scope.allMyProgramIds.push(program.programId);
            });
        } else {
           $scope.myPrograms = [];
        }
    });




    $scope.showError = function(error) {
        "use strict";
        let message = 'Error getting result from Product Webservice.';
        if (error.data && error.data.ErrorMessages && error.data.ErrorMessages.length > 0) {
            message += ' ' +error.data.ErrorMessages[0]['Value'];
        }
        $scope.$parent.sendAlert(message, 'danger');
    }


    $scope.allShopsLoading = true;
    productWebservice.GetShopList().then(
        (shopListResult)  => {
            $scope.allShops = shopListResult.data.Shops;
            $scope.allShopsLoading = false;
        },
        (error)  => {
            $scope.showError(error);
        }
    );




    $scope.searchProducts = function() {
        $scope.productPage = 1;
        $scope.searching = true;
        let params = _buildSearchParams();
        productWebservice.SearchProducts(params).then((result) => {
            "use strict";
            console.log(result);
            $scope.searching = false;
            $scope.searchFinished = true;
            $scope.totalRecords = result.data.ProductsSummary.TotalRecords;
            $scope.totalPages = result.data.ProductsSummary.TotalPages;
            $scope.productResult = result.data.Products;
             result.data.Products.forEach((product) => {
                 $scope.productDetails[product.ProductId] = product
            });
             console.log('DETAILS', $scope.productDetails);
        }, (error)  => {
            $scope.showError(error);
            $scope.searching = false;
            $scope.searchFinished = true;

        })
    };

    $scope.loadMore = function() {
        "use strict";
        $scope.productPage++;
        let params = _buildSearchParams();
        productWebservice.SearchProducts(params).then((result) => {
            "use strict";
            console.log(result);
            $scope.recordsOnPage = result.data.ProductsSummary.Records;
            result.data.Products.forEach((product) => {
                $scope.productResult.push(product)
            });
        }, (error)  => {
            $scope.showError(error);
        })
    }



    $scope.toggleProduct = function(productId) {
        if ($scope.selectedProductIds.includes(productId)) {
            $scope.selectedProductIds = $scope.selectedProductIds
                .filter( (prod) => prod !== productId);

        } else {
            $scope.selectedProductIds.push(productId);
        }
        console.log($scope.selectedProductIds);

    }

    $scope.createProductList = function (query) {
        let newItem = {name: query, products : [], id: new Date().getTime() + '-' + Math.random()};

        // name should be unique
        let exists = false;
        $scope.storedProductLists.forEach((list) => {
            if (list.name === query) {
                $scope.selectedProductList = list;
                exists = true;
            }
        });

        if (exists === true) {
            return;
        }

        $scope.storedProductLists.push(newItem);
        BrowserExtensionService.storage.local.set({
            storedProductLists : $scope.storedProductLists
        });
        $scope.selectedProductList = newItem;
        $scope.addProductsToProductList();
    };


    $scope.addProductsToProductList = function () {

        angular.forEach($scope.selectedProductIds, (productId) => {
            // do now allow dupes
            if (! $scope.selectedProductList.products.includes(productId)) {
                $scope.selectedProductList.products.push(productId);
            }
        });
        if ($scope.selectedProductIds.length > 0) {
            $scope.showSuccessMessage = true;
            $timeout(function(){   //Set timeout
                $scope.showSuccessMessage = false;
            },3000);
        }

        $scope.selectedProductIds = [];
        BrowserExtensionService.storage.local.set({
            storedProductLists : $scope.storedProductLists
        });



    };


    _shopsToShopIdCsv = function(shops) {
        let ids = [];
        angular.forEach(shops, (shop)=> {
            "use strict";
            ids.push(shop.ShopId)
        })
        return ids.join(',');

    }

    _categoriesToCSV = function(categories) {
        "use strict";
        console.log('categories: ', categories);
        let ids = [];
        angular.forEach(categories, (category)=> {
            "use strict";
            ids.push(category.Id)
        })
        return ids.join(',');
    }



    _buildSearchParams = () => {
        "use strict";

        let params = {
            CurrentPage : $scope.productPage,
            PageSize : 100,
            SortBy : 'Score',
            SortOrder : 'descending',
            ImageScales : 'Image180',
            WithImageOnly : 'true'

        };
        if ( $scope.priceSlider.minValue !== $scope.priceSlider.options.floor) {
            params.MinimumPrice =  $scope.priceSlider.minValue
        }
        if ( $scope.priceSlider.maxValue !== $scope.priceSlider.options.ceil) {
            params.MaximumPrice =  $scope.priceSlider.maxValue
        }


        // wenn shops ausgewählt nur diese shops
        if ($scope.selectedShops.length > 0) {
            params.ShopIds  = _shopsToShopIdCsv($scope.selectedShops);
            params.ShopIdMode = 'Include';
        }
        // wenn keine shops aber programme ausgewählt filter nur nach shops der programme
        else if($scope.selectedPrograms.length > 0) {
            params.ShopIds = _shopsToShopIdCsv($scope.shopsFilteredToSelectedPrograms)
            params.ShopIdMode = 'Include';
        }


        // genau ein shop ausgewählt entweder affilinetcategories <=> ShopCategories
        if ($scope.selectedShops.length === 1) {

            if($scope.selectedShopCategories.length > 0) {
                params.UseAffilinetCategories  = 'false';
                params.CategoryIds = _categoriesToCSV($scope.selectedShopCategories);
            }
        }

        if ($scope.search.length > 0) {
            params.Query  =  $scope.search;
        }

        return params;
    }

    $scope.reset = function () {
        $scope.priceSlider.minValue = 0;
        $scope.priceSlider.maxValue = $scope.priceSlider.options.ceil;
        $scope.search = '';
        $scope.selectedShops = [];
        $scope.selectedProgramsIds= [];
        $scope.selectedPrograms= [];
        $scope.selectedProductIds= [];
        $scope.selectedProducts= [];
        $scope.selectedShopCategories= [];
        BrowserExtensionService.storage.local.set({
            searchDiscoverShopsMinPrice : 0,
            searchDiscoverShopsMaxPrice : $scope.priceSlider.options.ceil
        })
    }



    $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
    }, 1000);

};
