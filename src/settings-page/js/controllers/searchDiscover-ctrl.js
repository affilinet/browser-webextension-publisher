angular.module('AffilinetToolbar')
    .controller('SearchDiscoverController', ['$scope', '$rootScope', 'LogonService', '$timeout', '$translate', 'productWebservice' ,  'BrowserExtensionService',  SearchDiscoverController]);

function SearchDiscoverController($scope, $rootScope, LogonService, $timeout,  $translate, productWebservice,  BrowserExtensionService) {
    $scope.loadingFinished = false;
    $translate('SEARCHDISCOVER_PageName').then(function (text) {
        $scope.$parent.pageName = text;

    });


    $scope.allShopsLoading = true;
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
    $scope.programUrls = [];
    $scope.programUrlsRequested = [];



    $scope.searchDiscoverShowDetails = {};

    $scope.searchKeyword = '';
    $scope.selectedPrograms = [];
    $scope.selectedShops = [];

    $scope.shopCategories = [];
    $scope.shopCategoriesLoading = false;

    $scope.selectedAffilinetCategories = [];
    $scope.selectedShopCategories = [];

    $scope.productResult = [];
    $scope.facetsResult = [];
    $scope.productPage = 1;


    $scope.selectedBrand = '';
    $scope.selectedDistributor = '';
    $scope.selectedManufacturer = '';
    $scope.selectedAffilinetCategoryPath = '';




    $scope.selectedProductIds = [];
    $scope.totalRecords = 0;
    $scope.totalPages = 0;
    let searchChangedTimeoutPromise;

    $scope.selectedProductList = null;

    let loadProducts = function (productIds){

        let i = 0;
        let batch = 0;
        let productBatches = [];
        angular.forEach(productIds, (productId) => {

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
                    response.data.Products.forEach((product) => {
                        $scope.productDetails[product.ProductId] = product;
                        getProgramUrlForProgramId(product.ProductId)
                    })
                }
            )
        });
    };


    $scope.setBrand = function(value) {
        "use strict";
        if ($scope.selectedBrand === value) {
            $scope.selectedBrand = '';
        } else {
            $scope.selectedBrand =  value;
        }
        searchIfValid()
    };
    $scope.setManufacturer = function(value) {
        if ($scope.selectedManufacturer === value) {
            $scope.selectedManufacturer = '';
        } else {
            $scope.selectedManufacturer =  value;
        }
        searchIfValid()
    };
    $scope.setDistributor = function(value) {
        if ($scope.selectedDistributor === value) {
            $scope.selectedDistributor = '';
        } else {
            $scope.selectedDistributor =  value;
        }
        searchIfValid()
    };
    $scope.setAffilinetCategoryPath = function(value) {
        if ($scope.selectedAffilinetCategoryPath === value) {
            $scope.selectedAffilinetCategoryPath = '';
        } else {
            $scope.selectedAffilinetCategoryPath =  value;
        }
        searchIfValid()
    };

    $scope.toggleFilters = function () {
        $scope.showFilters= !$scope.showFilters
    };

    let loadInitialValues = function  () {
        BrowserExtensionService.storage.local.get(
            ['storedProductLists',
                'searchDiscoverShowDetails',
                'searchDiscoverLastKeyword',
                'searchDiscoverSelectedShopCategories',
                'searchDiscoverSelectedShops',
                'searchDiscoverSelectedPrograms',
                'searchDiscoverSelectedProgramIds',
                'searchDiscoverSelectedProductIds',
                'searchDiscoverSelectedBrand',
                'searchDiscoverSelectedDistributor',
                'searchDiscoverSelectedManufacturer',
                'searchDiscoverSelectedAffilinetCategoryPath',
                'searchDiscoverShowFilters',
                'searchDiscoverShopsFilteredToSelectedPrograms',
                'searchDiscoverShopsMinPrice',
                'searchDiscoverShopsMaxPrice',
            ]
            , function(result) {
                console.log('result from storage', result);
                if (result.storedProductLists) {
                    $scope.storedProductLists = result.storedProductLists;
                } else {
                    $scope.storedProductLists = [];
                }
                if (result.searchDiscoverShowDetails) {
                    $scope.searchDiscoverShowDetails = result.searchDiscoverShowDetails;
                }
                if (result.searchDiscoverLastKeyword) {
                    $scope.searchKeyword = result.searchDiscoverLastKeyword;
                }
                if (result.searchDiscoverSelectedShopCategories) {
                    $scope.selectedShopCategories = result.searchDiscoverSelectedShopCategories;
                }
                if (result.searchDiscoverSelectedShops) {
                    $scope.selectedShops = result.searchDiscoverSelectedShops;
                }

                if (result.searchDiscoverShopsFilteredToSelectedPrograms) {
                    $scope.shopsFilteredToSelectedPrograms = result.searchDiscoverShopsFilteredToSelectedPrograms;
                }

                if (result.searchDiscoverSelectedProgramIds) {
                    $scope.selectedProgramsIds = result.searchDiscoverSelectedProgramIds;
                }
                if (result.searchDiscoverSelectedBrand) {
                    $scope.selectedBrand = result.searchDiscoverSelectedBrand;
                }

                if (result.searchDiscoverSelectedDistributor) {
                    $scope.selectedDistributor = result.searchDiscoverSelectedDistributor;
                }

                if (result.searchDiscoverSelectedManufacturer) {
                    $scope.selectedManufacturer = result.searchDiscoverSelectedManufacturer;
                }

                if (result.searchDiscoverSelectedAffilinetCategoryPath) {
                    $scope.selectedAffilinetCategoryPath = result.searchDiscoverSelectedAffilinetCategoryPath;
                }
                if (result.searchDiscoverShowFilters) {
                    $scope.showFilters = result.searchDiscoverShowFilters;
                }

                if (result.searchDiscoverSelectedPrograms) {
                    $scope.selectedPrograms = result.searchDiscoverSelectedPrograms;
                }
                if (result.searchDiscoverSelectedProductIds) {
                    $scope.selectedProductIds = result.searchDiscoverSelectedProductIds;
                    console.log('selected product ids', $scope.selectedProductIds);

                    if ($scope.selectedProductIds.length > 0 ) {
                        loadProducts($scope.selectedProductIds)

                    }


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
                            searchIfValid ();
                            BrowserExtensionService.storage.local.set({
                                searchDiscoverShopsMinPrice : min,
                                searchDiscoverShopsMaxPrice : max
                            })
                        }
                    }
                };
                searchIfValid ();
                bindWatch();
                $scope.$apply(function(){
                    $scope.loadingFinished = true;
                })



            });
    }


    function bindWatch() {
        $scope.$watch( 'searchDiscoverShowDetails', (searchDiscoverShowDetails)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverShowDetails : searchDiscoverShowDetails})
            }, true
        );

        $scope.$watch( 'selectedProgramIds', (selectedProgramIds)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverSelectedProgramIds : selectedProgramIds})
                resetFilters()
            }, true
        );

        $scope.$watch( 'selectedProductIds', (selectedProductIss)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverSelectedProductIds : selectedProductIss})
            }, true
        );


        $scope.$watch( 'selectedBrand', (selectedBrand)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverSelectedBrand : selectedBrand})
                searchIfValid (true);
            }, true
        );

        $scope.$watch( 'selectedManufacturer', (selectedManufacturer)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverSelectedManufacturer : selectedManufacturer})
                searchIfValid (true);
            }, true
        );
        $scope.$watch( 'selectedDistributor', (selectedDistributor)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverSelectedDistributor : selectedDistributor})
                searchIfValid (true);
            }, true
        );
        $scope.$watch( 'selectedAffilinetCategoryPath', (selectedAffilinetCategoryPath)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverSelectedAffilinetCategoryPath : selectedAffilinetCategoryPath})
                searchIfValid (true);
            }, true
        );

        $scope.$watch( 'showFilters', (showFilters)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverShowFilters : showFilters});
            }
        );

        $scope.$watch( 'selectedPrograms',
            (selectedPrograms)  => {
                BrowserExtensionService.storage.local.set({searchDiscoverSelectedPrograms : selectedPrograms})
                resetFilters()
                if (selectedPrograms.length === 0) {
                    $scope.shopsFilteredToSelectedPrograms = $scope.allShops;
                    BrowserExtensionService.storage.local.set({searchDiscoverShopsFilteredToSelectedPrograms : $scope.shopsFilteredToSelectedPrograms})
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
                    BrowserExtensionService.storage.local.set({searchDiscoverShopsFilteredToSelectedPrograms : $scope.shopsFilteredToSelectedPrograms})
                    $scope.allShopsLoading = false;
                    searchIfValid ();
                }
            }
        );




        $scope.$watch('selectedShops', (selectedShops) => {
            resetFilters()
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
            searchIfValid ();

        });
        $scope.$watch('selectedShopCategories', function(shopCategories){
            resetFilters()
            BrowserExtensionService.storage.local.set({searchDiscoverSelectedShopCategories : shopCategories});
            searchIfValid ();
        });

        $scope.$watch('searchKeyword', (searchKeyword)=> {
            resetFilters()
            console.log('Search Keyword changed', searchKeyword);
            BrowserExtensionService.storage.local.set({searchDiscoverLastKeyword : searchKeyword});
            searchIfValid ();
        });


    }

    

    let searchIfValid  = function(immidiately = false) {
        let delay;
        if (!immidiately) {
            delay = 500
        } else {
            delay = 0;
        }
        if ($scope.loadingFinished === false) {
            return;
        }


        $timeout.cancel(searchChangedTimeoutPromise);  //does nothing, if timeout already done

        if ($scope.searchKeyword === '' && $scope.selectedShopCategories.length === 0) {
            return
        }


        searchChangedTimeoutPromise = $timeout(function(){   //Set timeout
            $scope.searching = true;
            console.debug('search if valid runs with', $scope.searchKeyword , $scope.selectedShopCategories, $scope.selectedPrograms, $scope.shopsFilteredToSelectedPrograms);
            $scope.searchProducts();
        },delay);


    }

    
    let showError  = function(error) {
        "use strict";
        let message = 'Error getting result from Product Webservice.';
        if (error.data && error.data.ErrorMessages && error.data.ErrorMessages.length > 0) {
            message += ' ' +error.data.ErrorMessages[0]['Value'];
        }
        $scope.$parent.sendAlert(message, 'danger');
    }





    let init = function() {

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
        productWebservice.GetShopList().then(
            (shopListResult)  => {
                $scope.allShops = shopListResult.data.Shops;
                $scope.allShopsLoading = false;
                console.log('INIT');
                loadInitialValues()

            },
            (error)  => {
                showError (error);
            }
        );

    }






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

            if (result.data.Facets) {
                $scope.facetsResult = _buildFacets(result.data.Facets)
            }

            result.data.Products.forEach((product) => {
                 $scope.productDetails[product.ProductId] = product;
                 getProgramUrlForProgramId(product.ProgramId);
            });
        }, (error)  => {
            showError (error);
            $scope.searching = false;
            $scope.searchFinished = true;

        })
    };

    let getProgramUrlForProgramId = function(ProgramId) {
        if (!$scope.programUrlsRequested[ProgramId]) {
            $scope.programUrlsRequested[ProgramId] = true;
            BrowserExtensionService.runtime.sendMessage({action : 'get-programDetailsForProgramId', data : { programId : ProgramId}},
                function(programDetails){
                    if (programDetails !== false) {
                        $scope.$apply(function(){
                            $scope.programUrls[ProgramId] = programDetails.programUrl;
                        });
                    }
                })
        }
    }

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
            showError (error);
        })
    }



    $scope.toggleProduct = function(productId) {
        if ($scope.selectedProductIds.includes(productId)) {
            $scope.selectedProductIds = $scope.selectedProductIds
                .filter( (prod) => prod !== productId);

        } else {
            $scope.selectedProductIds.unshift(productId);
        }
        console.log($scope.selectedProductIds);
    }
    $scope.addAllProducts = function(){
        "use strict";
        $scope.productResult.forEach((product) => {
            if (!$scope.selectedProductIds.includes(product.ProductId)) {
                $scope.selectedProductIds.unshift(product.ProductId);
            }
        })
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

        $scope.storedProductLists.unshift(newItem);
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
                $scope.selectedProductList.products.unshift(productId);
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
            WithImageOnly : 'true',
            FacetFields : 'Brand,AffilinetCategoryPathFacet,Manufacturer,Distributor',
            FacetValueLimit : 10,
        };

        if ( $scope.priceSlider.minValue !== $scope.priceSlider.options.floor) {
            params.MinimumPrice =  $scope.priceSlider.minValue
        }
        if ( $scope.priceSlider.maxValue !== $scope.priceSlider.options.ceil) {
            params.MaximumPrice =  $scope.priceSlider.maxValue
        }

        // Filter Query

        let fq = '';
        if ($scope.selectedBrand !== '') {
            fq += ',Brand:' + ($scope.selectedBrand);
        }
        if ($scope.selectedDistributor !== '') {
            fq += ',Distributor:' + ($scope.selectedDistributor);
        }
        if ( $scope.selectedManufacturer !== '') {
            fq += ',Manufacturer:' + ($scope.selectedManufacturer);
        }
        if ( $scope.selectedAffilinetCategoryPath !== '') {
            fq += ',AffilinetCategoryPathFacet:' + $scope.selectedAffilinetCategoryPath;
        }
        if (fq !== '' ) {
            params.FQ = fq.slice(1);
        }


        // wenn shops ausgewählt nur diese shops
        if ($scope.selectedShops.length > 0) {
            params.ShopIds  = _shopsToShopIdCsv($scope.selectedShops);
            params.ShopIdMode = 'Include';
        }
        // wenn keine shops aber programme ausgewählt filter nur nach shops der programme
        else if($scope.selectedPrograms.length > 0) {
            if ($scope.shopsFilteredToSelectedPrograms.length === 0) {
                console.error('NOT YET LOADED $scope.shopsFilteredToSelectedPrograms', $scope.shopsFilteredToSelectedPrograms)
            }
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

        if ($scope.searchKeyword.length > 0) {
            params.Query  =  $scope.searchKeyword;
        }

        return params;
    };


    _buildFacets = function (facetResult) {
        "use strict";
        let facets = [];
        facetResult.forEach(function (facet) {
            let res = { facetField : facet.FacetField, values : []};
            facet.FacetValues.forEach(function(facetValue) {
                let displayName;

                if (facet.FacetField === 'AffilinetCategoryPathFacet') {
                    displayName = $scope.affilinetCategoryPathToDisplayValue(facetValue.FacetValueName)
                } else {
                    displayName = $scope.ucfirst(facetValue.FacetValueName) ;
                }
                let val = {
                    displayName :  displayName + ' (' +  facetValue.FacetValueCount  +')',
                    FacetValueName : facetValue.FacetValueName ,
                    FacetValueCount: facetValue.FacetValueCount
                };
                res.values.push(val)
            });
            facets.push(res);
        });
        return facets;
    };

    $scope.ucfirst = function(string) {
        "use strict";

        if (typeof string !== 'undefined'){
            return string.charAt(0).toUpperCase() + string.slice(1)
        }
        return string

    };

    $scope.affilinetCategoryPathToDisplayValue = function(name) {
        "use strict";
        let displayName;
        let $values = name.split('^');
        if ($values[3] === $values[1]) return $values[1];
        return $values[3];
    };


    let resetFilters = function () {
        $scope.selectedBrand = '';
        $scope.selectedManufacturer = '';
        $scope.selectedDistributor = '';
        $scope.selectedAffilinetCategoryPath = '';
    };
    $scope.reset = function () {
        $scope.priceSlider.minValue = 0;
        $scope.priceSlider.maxValue = $scope.priceSlider.options.ceil;
        $scope.searchKeyword = '';
        $scope.selectedShops = [];
        resetFilters()
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


    init();
}
