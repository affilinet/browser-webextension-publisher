angular.module('AffilinetToolbar')
    .controller('OrdersController', ['$scope', 'LogonService', '$sce', '$location', '$moment', '$translate', '$rootScope', '$window', OrdersController]);

function OrdersController($scope, LogonService, $sce, $location, $moment, $translate, $rootScope, $window) {
    $scope.loadingFinished = false;

    $translate('ORDERS_PageName').then(function (text) {
        $scope.$parent.pageName = text;
    });

    $translate('ORDERS_ChartLabelConfCommission').then(function (text) {
        $scope.labelConfirmedCommission = text;
    });
    $translate('ORDERS_ChartLabelTotalSales').then(function (text) {
        $scope.labelTotalSales = text;
    });

    $translate('LOCALE_DATEFORMAT').then(function (text) {
        $scope.dateFormat = text;
    });

    $scope.month = new $moment().format('MM');
    $scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    $scope.year = new $moment().format('YYYY');

    var years = [];

    for (var i = ($scope.year - 3); i <= $scope.year; i++) {
        years.push(i);
    }
    $scope.years = years;

    $scope.ApiLocale = $window.ApiLocale;

    function moneyFormater(v, axis) {
        if ($scope.ApiLocale == 'en-gb' || $scope.ApiLocale == 'en-GB') {
            return v.toLocaleString('en-gb', {localeMatcher: 'best fit', style: 'currency', currency: "GBP"});
        }
        if ($scope.ApiLocale == 'de-ch' || $scope.ApiLocale == 'de-CH') {
            return v.toLocaleString('de-ch', {localeMatcher: 'best fit', style: 'currency', currency: "CHF"});
        }
        return v.toLocaleString('de-DE', {localeMatcher: 'best fit', style: 'currency', currency: "EUR"});

    }

    $scope.chartOptionsByDay = {
        yaxes: [
            {
                position: "left",
                min: 0,
                tickDecimals: 0
            },
            {
                position: "right",
                min: 0,
                tickDecimals: 2,
                tickFormatter: moneyFormater

            }
        ],
        grid: {
            hoverable: true,
            clickable: false,
            borderWidth: 0
        },
        xaxis: {
            mode: "time",
            tickLength: 0, // hide gridlines
            minTickSize: [1, "day"],
            timeformat: "%e.%b.%Y"
        },
        series: {
            lines: {show: true},
            points: {show: true}
        }
    };

    $scope.chartOptionsByProgram = {
        xaxis: {
            mode: "categories",
            tickLength: 0 // hide gridlines
        },
        yaxes: [
            {
                position: "left",
                min: 0,
                tickDecimals: 0
            },
            {
                position: "right",
                min: 0,
                tickDecimals: 2,
                tickFormatter: moneyFormater
            }
        ],
        grid: {
            hoverable: true,
            clickable: false,
            borderWidth: 0
        },
        series: {
            shadowSize: 1
        },
        legend: {
            show: true,
            position: "ne",
            container: null
        }
    };


    $scope.chartDataByDay = [];
    $scope.chartDataByProgram = [];
    $scope.chartDataByProgramValues = [];

    var formatstring = 'YYYY-MM-DDTHH:mm:ss';

    $scope.loadDataByDay = function (month, year) {

        $scope.chartDataByDay = [];

        var totalCommission = [];
        var totalSales = [];
        $scope.tableByDay = [];
        $scope.tableByDaySum = [];

        $scope.start = new $moment(month + ' ' + year, 'MM YYYY').startOf('month').format(formatstring);
        $scope.end = new $moment(month + ' ' + year, 'MM YYYY').endOf('month').format(formatstring);


        LogonService.GetDailyStatistics($scope.start, $scope.end).then(function (response) {

            var Total = response.data.Envelope.Body.GetDailyStatisticsResponse.DailyStatisticsRecords.Total;
            var DailyStatisticsRecords = response.data.Envelope.Body.GetDailyStatisticsResponse.DailyStatisticsRecords.DailyStatisticRecords.DailyStatisticsRecord;

            // update the total Sum for each Column
            $scope.tableByDaySum['views'] = parseInt(Total.PayPerClick.Views.toString()) + parseInt(Total.CombinedPrograms.Views.toString()) + parseInt(Total.PayPerSaleLead.Views.toString());
            $scope.tableByDaySum['clicks'] = parseInt(Total.PayPerClick.Clicks.toString()) + parseInt(Total.CombinedPrograms.Clicks.toString()) + parseInt(Total.PayPerSaleLead.Clicks.toString());
            $scope.tableByDaySum['openSaleLeads'] = parseInt(Total.CombinedPrograms.OpenSales.toString()) + parseInt(Total.PayPerSaleLead.OpenSales.toString());
            $scope.tableByDaySum['confirmedSaleLeads'] = parseInt(Total.CombinedPrograms.ConfirmedSales.toString()) + parseInt(Total.PayPerSaleLead.ConfirmedSales.toString());
            $scope.tableByDaySum['cancelledSaleLeads'] = parseInt(Total.CombinedPrograms.CancelledSales.toString()) + parseInt(Total.PayPerSaleLead.CancelledSales.toString());
            $scope.tableByDaySum['openCommission'] = moneyFormater(parseFloat(Total.TotalOpenCommission.toString()), false);
            $scope.tableByDaySum['commission'] = moneyFormater(parseFloat(Total.TotalCommission.toString()), false);


            for (var i = 0; i < DailyStatisticsRecords.length; i++) {

                var timestamp = $moment(DailyStatisticsRecords[i].Date.toString(), formatstring).format('x');
                var day = $moment(DailyStatisticsRecords[i].Date.toString(), formatstring).format('D') - 1;

                /**
                 * for display in chart total Commission
                 */
                var commission = +(DailyStatisticsRecords[i].TotalCommission.toString());

                if (totalCommission[day] == undefined) {
                    totalCommission[day] = [timestamp, commission];
                }

                /**
                 * for display in chart total Orders
                 */
                var sales = +DailyStatisticsRecords[i].CombinedPrograms.ConfirmedSales.toString() + +DailyStatisticsRecords[i].PayPerSaleLead.ConfirmedSales.toString() + parseInt(DailyStatisticsRecords[i].CombinedPrograms.OpenSales.toString()) + parseInt(DailyStatisticsRecords[i].PayPerSaleLead.OpenSales.toString());
                if (totalSales[day] == undefined) {
                    totalSales[day] = [timestamp, sales];
                }

                /**
                 * populate the table for byDay data
                 */

                var views = parseInt(DailyStatisticsRecords[i].PayPerClick.Views.toString()) + parseInt(DailyStatisticsRecords[i].CombinedPrograms.Views.toString()) + parseInt(DailyStatisticsRecords[i].PayPerSaleLead.Views.toString());
                var clicks = parseInt(DailyStatisticsRecords[i].PayPerClick.Clicks.toString()) + parseInt(DailyStatisticsRecords[i].CombinedPrograms.Clicks.toString()) + parseInt(DailyStatisticsRecords[i].PayPerSaleLead.Clicks.toString());
                var openSaleLeads = parseInt(DailyStatisticsRecords[i].CombinedPrograms.OpenSales.toString()) + parseInt(DailyStatisticsRecords[i].PayPerSaleLead.OpenSales.toString());
                var confirmedSaleLeads = parseInt(DailyStatisticsRecords[i].CombinedPrograms.ConfirmedSales.toString()) + parseInt(DailyStatisticsRecords[i].PayPerSaleLead.ConfirmedSales.toString());
                var cancelledSaleLeads = parseInt(DailyStatisticsRecords[i].CombinedPrograms.CancelledSales.toString()) + parseInt(DailyStatisticsRecords[i].PayPerSaleLead.CancelledSales.toString());
                var openCommission = parseFloat(DailyStatisticsRecords[i].TotalOpenCommission.toString());


                $scope.tableByDay[day] = [];
                $scope.tableByDay[day]['date'] = new $moment(DailyStatisticsRecords[i].Date.toString(), formatstring).format($scope.dateFormat);


                $scope.tableByDay[day]['views'] = views;
                $scope.tableByDay[day]['clicks'] = clicks;
                $scope.tableByDay[day]['openSaleLeads'] = openSaleLeads;
                $scope.tableByDay[day]['confirmedSaleLeads'] = confirmedSaleLeads;
                $scope.tableByDay[day]['cancelledSaleLeads'] = cancelledSaleLeads;
                $scope.tableByDay[day]['openCommission'] = moneyFormater(openCommission, false);
                $scope.tableByDay[day]['commission'] = moneyFormater(commission, false);


            }

            $scope.chartDataByDay = [
                {label: $scope.labelConfirmedCommission, color: '#3B302D', data: totalCommission, yaxis: 2},
                {label: $scope.labelTotalSales, color: '#a8a199', data: totalSales, yaxis: 1}
            ];

            $scope.loadingFinished = true;
        });

    };

    $scope.pushToByProgramChart = function (title, sales, commission) {

        if ($scope.chartDataByProgramOrder.length < 10) {
            $scope.chartDataByProgramOrder.push([title, sales]);
            $scope.chartDataByProgramCommission.push([title, commission]);
        }
        else {
            // find shortProgramName with lowest totalCommission

            var lowest = Infinity;
            var lowestProgramName = false;

            // find the name of the lowest program in chart
            angular.forEach($scope.chartDataByProgramCommission, function (elem) {
                "use strict";
                if (elem[1] < lowest) {
                    lowestProgramName = elem[0];
                    lowest = elem[1]
                }
            });

            // get the index of this lowest program
            var index = $scope.chartDataByProgramCommission.findIndex(function (elem) {
                return elem[0] == lowestProgramName && elem[1] == lowest;
            });
            // splice out the lowest program
            $scope.chartDataByProgramOrder.splice(index, 1);
            $scope.chartDataByProgramCommission.splice(index, 1);

            // add the new element which has a higher commission
            $scope.chartDataByProgramOrder.push([title, sales]);
            $scope.chartDataByProgramCommission.push([title, commission]);
        }

    };


    $scope.loadDataByProgram = function (month, year) {

        $scope.chartDataByProgram = [];
        $scope.chartDataByProgramOrder = [];
        $scope.chartDataByProgramCommission = [];
        $scope.tableByProgram = [];

        $scope.start = new $moment(month + ' ' + year, 'MM YYYY').startOf('month').format(formatstring);
        $scope.end = new $moment(month + ' ' + year, 'MM YYYY').endOf('month').format(formatstring);


        LogonService.GetAllProgramStatistics($scope.start, $scope.end).then(function (response) {


            var programs = [];

            // these can be array or single result.. thx soap!
            var PayPerSaleLeadStatistics = response.data.Envelope.Body.GetProgramStatisticsResponse.ProgramStatisticsRecords.PayPerSaleLeadStatistics.StatisticsRecords;

            angular.forEach(PayPerSaleLeadStatistics, function (statisticsRecords) {
                if (angular.isUndefined(statisticsRecords.ProgramTitle)) {
                    angular.forEach(statisticsRecords, function (statisticsRecord) {
                        if (!angular.isUndefined(statisticsRecord.ProgramTitle)) {
                            programs.push(statisticsRecord);
                        }
                    });
                } else {
                    programs.push(statisticsRecords);
                }
            });


            var CombinedProgramStatistics = response.data.Envelope.Body.GetProgramStatisticsResponse.ProgramStatisticsRecords.CombinedProgramStatistics.StatisticsRecords;

            angular.forEach(CombinedProgramStatistics, function (statisticsRecords) {
                if (angular.isUndefined(statisticsRecords.ProgramTitle)) {
                    angular.forEach(statisticsRecords, function (statisticsRecord) {
                        if (!angular.isUndefined(statisticsRecord.ProgramTitle)) {
                            programs.push(statisticsRecord);
                        }
                    });
                } else {
                    programs.push(statisticsRecords);
                }
            });


            var PayPerClickStatistics = response.data.Envelope.Body.GetProgramStatisticsResponse.ProgramStatisticsRecords.PayPerClickStatistics.StatisticsRecords;
            angular.forEach(PayPerClickStatistics, function (statisticsRecords) {
                if (angular.isUndefined(statisticsRecords.ProgramTitle)) {
                    angular.forEach(statisticsRecords, function (statisticsRecord) {
                        if (!angular.isUndefined(statisticsRecord.ProgramTitle)) {
                            programs.push(statisticsRecord);
                        }
                    });
                } else {
                    programs.push(statisticsRecords);
                }
            });


            angular.forEach(programs, function (statisticsRecord) {
                if (!angular.isUndefined(statisticsRecord.ProgramTitle)) {

                    var openCommission = statisticsRecord.OpenCommission.toString();
                    var commission = statisticsRecord.Commission.toString();

                    $scope.tableByProgram.push({
                        name: statisticsRecord.ProgramTitle.toString(),
                        programId: statisticsRecord.ProgramId.toString(),
                        views: statisticsRecord.Views.toString(),
                        clicks: statisticsRecord.Clicks.toString(),
                        openSaleLeads: statisticsRecord.OpenSales.toString(),
                        confirmedSaleLeads: statisticsRecord.Sales.toString(),
                        cancelledSaleLeads: statisticsRecord.CancelledSales.toString(),
                        openCommission: moneyFormater(parseFloat(openCommission), false),
                        commission: moneyFormater(parseFloat(commission), false)
                    });
                    var shortProgramName = statisticsRecord.ProgramTitle.toString();
                    if (shortProgramName.length > 10) {
                        shortProgramName = shortProgramName.substring(0, 10) + '...';
                    }
                    $scope.pushToByProgramChart(shortProgramName, +statisticsRecord.Sales.toString(), +statisticsRecord.Commission.toString());
                }
            });
            $scope.loadingFinished = true;
        });


        $scope.chartDataByProgram.push({
            data: $scope.chartDataByProgramOrder,
            label: $scope.labelTotalSales,
            color: '#a8a199',
            yaxis: 1,
            bars: {
                show: true,
                fill: true,
                order: 1,
                barWidth: 0.25,
                align: 'right',
                fillColor: '#a8a199'
            }

        }, {
            data: $scope.chartDataByProgramCommission,
            label: $scope.labelConfirmedCommission,
            color: '#3B302D',
            yaxis: 2,
            bars: {
                show: true,
                fill: true,
                order: 2,
                barWidth: 0.25,
                align: 'left',
                fillColor: '#3B302D'

            }
        });


    };


    $scope.showData = function (month, year) {
        $scope.loadDataByDay(month, year);
        $scope.loadDataByProgram(month, year);
    };


    var checkApiLocale = function () {
        if (typeof $window.ApiLocale !== 'undefined' && $window.ApiLocale) {
            clearInterval(refreshIntervalId);
            $scope.ApiLocale = $window.ApiLocale;
            $scope.showData($scope.month, $scope.year);
        }
    };
    var refreshIntervalId = null;
    refreshIntervalId = setInterval(checkApiLocale, 50);


    $scope.refreshPlot = function (that, month, year) {
        $scope.loadDataByDay(month, year);
        $scope.loadDataByProgram(month, year);
        $('#' + that).css('display', 'block');
        $('#' + that).css('clear', 'both');

        //$.plot();
    };


}
