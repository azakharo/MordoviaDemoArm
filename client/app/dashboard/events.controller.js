'use strict';

angular.module('demoarmApp')
  .controller('EventsCtrl', function ($scope) {
    $scope.events = ['event 1', 'event 2', 'event 3'];
  });
