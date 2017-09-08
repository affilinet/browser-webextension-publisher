angular.module('AffilinetToolbar')
    .controller('applyNowController', ['$scope', '$rootScope', 'LogonService', '$sce', '$location', '$moment', '$translate', '$stateParams', applyNowController]);

function applyNowController($scope, $rootScope, LogonService, $sce, $location, $moment, $translate, $stateParams) {
    console.log($stateParams.programId);

    $scope.programDescription = 'No program description yet';
    $scope.limitationsComment = '';
    $scope.LaunchDate = '';

    $scope.loadingFinished = false;
    $translate('APPLY_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });

    String.prototype.trunc = String.prototype.trunc ||
        function (n) {
            return (this.length > n) ? this.substr(0, n - 1) + '...' : this;
        };


    LogonService.GetProgram($stateParams.programId).then(function (response) {
        $scope.program = response.data.Envelope.Body.GetProgramsResponse.ProgramCollection.Program;

        console.log(response.data);

        if ($scope.program && $scope.program.ProgramDescription) {
            $scope.programDescription = $scope.program.ProgramDescription.toString().replace(/<(?:.|\n)*?>/gm, '').trunc(100);
        }

        if ($scope.program && $scope.program.LimitationsComment) {
            $scope.limitationsComment = $scope.program.LimitationsComment.toString().replace(/<(?:.|\n)*?>/gm, '').trunc(50);
        }

        if ($scope.program && $scope.program.LaunchDate) {
            $scope.LaunchDate = $moment($scope.program.LaunchDate.toString(), 'YYYY-MM-DDTHH:mm:ss').format('DD.MM.YYYY');
        }



        $scope.loadingFinished = true;
    }, function error(response) {
        console.log(response.data.Envelope.Body.Fault);
    })
}


