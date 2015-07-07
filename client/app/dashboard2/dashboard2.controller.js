'use strict';

var mod = angular.module('demoarmApp');

mod.controller('Dashboard2Ctrl', function ($scope, $state) {
  $(window).resize(function () {
    // TODO solve issue with Highcharts and window resizing. The following is work-around.
    $state.reload();
  });
});
