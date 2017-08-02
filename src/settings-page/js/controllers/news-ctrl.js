angular.module('AffilinetToolbar')
    .controller('NewsController', ['$scope', '$rootScope', 'LogonService', '$sce', '$translate', NewsController]);

function NewsController($scope, $rootScope, LogonService, $sce, $translate) {
    $scope.loadingFinished = false;
    $translate('NEWS_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });


    //$scope.$parent.sendAlert('test', 'danger');


    LogonService.GetNewPrograms().then(function (response) {
        $scope.newPrograms = response.data.Envelope.Body.GetProgramsResponse.ProgramCollection.Program;
    }, function error(response) {
        console.log(response.data.Envelope.Body.Fault.faultstring.toString());
    });

    LogonService.GetNewVouchers().then(function (response) {
        $scope.newVouchers = response.data.Envelope.Body.SearchVoucherCodesResponse.VoucherCodeCollection.VoucherCodeItem;
        var programIds = [];

        angular.forEach($scope.newVouchers, function (key, val) {
            programIds.push(key.ProgramId.toString());

        });
        // now fetch the programinfo for each program
        LogonService.GetProgramInfoForIds(programIds).then(function (response) {

                var voucherProgramResponse = response.data.Envelope.Body.GetProgramsResponse.ProgramCollection.Program;
                $scope.voucherProgramInfo = [];
                angular.forEach(voucherProgramResponse, function (val, key) {
                    $scope.voucherProgramInfo[val.ProgramId] = val;
                });

            }
        );
        $scope.loadingFinished = true;

    }, function error(response) {
        console.log(response.data.Envelope.Body.Fault.faultstring.toString());
    });


};
