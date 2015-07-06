'use strict';

var mod = angular.module('demoarmApp');

mod.controller('Dashboard2Ctrl', function ($scope, $window) {
  $(window).resize(function () {
    //$timeout(resizeCharts, 100);
    // TODO solve issue with Highcharts and window resizing. The following is work-around.
    $window.location.reload();
  });
});
