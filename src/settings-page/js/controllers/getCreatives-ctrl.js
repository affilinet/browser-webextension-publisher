angular.module('AffilinetToolbar')
    .controller('getCreativesController', ['$scope', '$rootScope', 'LogonService', '$translate', '$stateParams', getCreativesController]);

function getCreativesController($scope, $rootScope, LogonService, $translate, $stateParams) {
    $scope.loadingFinished = false;
    $translate('GETCREATIVES_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });


    $scope.sizes = {
        'Leaderbord/Super Banner': '728x90',
        'Standard Banner/Full Banner': '468x60',
        'Medium Rectangle': '300x250',
        'Square Button': '250x250',
        'Wide Skyscraper': '160x600',
        'Skyscraper': '120x600'
    };

    $scope.size = '728x90';

    LogonService.GetCreatives($stateParams.programId).then(function (response) {
        $scope.creatives = [];

        angular.forEach(response.data.Envelope.Body.SearchCreativesResponse.CreativeCollection.Creative, function (creative) {
            $scope.creatives.push(creative);
        });

        $scope.loadingFinished = true;

    }, function error(response) {
        console.log(response.data.Envelope.Body.Fault.faultstring.toString());
    });

    $scope.show = function (creative) {
        var shown;
        if ((typeof creative.BannerStub != 'undefined') && (typeof creative.BannerStub.Width != 'undefined')) {
            shown = (creative.BannerStub.Width.toString() + 'x' + creative.BannerStub.Height.toString() == $scope.size);
            return shown;
        }
        if ((typeof creative.HTMLStub != 'undefined') && (typeof creative.HTMLStub.Width != 'undefined')) {
            shown = (creative.HTMLStub.Width.toString() + 'x' + creative.HTMLStub.Height.toString() == $scope.size);
            return shown;
        }
    };


    $scope.getPreviewURL = function (creative) {
        var type, platform, previewUrl, integrationCode;
        integrationCode = creative.IntegrationCode.toString();

        console.log($rootScope.credentials.publisherId );


        // detect the platform depending on integration code
        if (integrationCode.search('/banners.webmasterplan.com/')) {
            platform = 'de';
        } else if (integrationCode.search('/become.successfultogether.co.uk/')) {
            platform = 'uk';
        } else if (integrationCode.search('/banniere.reussissonsensemble.fr/')) {
            platform = 'fr';
        } else if (integrationCode.search('/worden.samenresultaat.nl/')) {
            platform = 'nl';
        } else if (integrationCode.search('/program.epartner.es/')) {
            platform = 'es';
        }

        // set banner or html
        if (creative.CreativeTypeEnum.toString() == 'Banner') {
            type = 'b';
        } else {
            type = 'h';
        }

        // return the preview URL
        return 'http://www.affilinet-toolbar.com/creativepreview.php?platform='
            + platform
            + '&ref='
            + $rootScope.credentials.publisherId
            + '&site='
            + parseInt(creative.ProgramId.toString())
            + '&ad_type='
            + type
            + '&ad_number='
            + parseInt(creative.CreativeNumber.toString());
    };

}
