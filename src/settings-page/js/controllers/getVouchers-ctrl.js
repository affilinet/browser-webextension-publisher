angular.module('AffilinetToolbar')
    .controller('getVouchersController', ['$scope', '$rootScope', 'LogonService', '$stateParams', '$translate', getVouchersController]);

function getVouchersController($scope, $rootScope, LogonService, $stateParams, $translate) {
    $scope.loadingFinished = false;

    $translate('GETVOUCHERS_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });

    LogonService.GetProgram($stateParams.programId).then(function (response) {
        $scope.programInfo = response.data.Envelope.Body.GetProgramsResponse.ProgramCollection.Program;


    });

    LogonService.GetVouchers($stateParams.programId).then(function (response) {
        $scope.vouchersCount = parseInt(response.data.Envelope.Body.SearchVoucherCodesResponse.TotalResults);


        if ($scope.vouchersCount == 0) {
            $scope.noVouchers = true;
        }
        else if ($scope.vouchersCount === 1) {
            console.log('one voucher');
            $scope.noVouchers = false;
            console.log(response.data.Envelope.Body.SearchVoucherCodesResponse);
            $scope.vouchers = [];
            $scope.vouchers[0] = response.data.Envelope.Body.SearchVoucherCodesResponse.VoucherCodeCollection.VoucherCodeItem;
        }
        else {
            console.log('else voucher');
            $scope.noVouchers = false;
            console.log(response.data.Envelope.Body.SearchVoucherCodesResponse);
            $scope.vouchers = response.data.Envelope.Body.SearchVoucherCodesResponse.VoucherCodeCollection.VoucherCodeItem;
        }
        $scope.contentLoaded = true;
        $scope.loadingFinished = true;
    }, function error(response) {
        console.log(response.data.Envelope.Body.Fault.faultstring.toString());
    })
}
