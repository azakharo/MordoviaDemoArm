'use strict';

angular.module('demoarmApp')
  .controller('EventsCtrl', function ($scope, $interval, $log, myRest) {
    var stopAutoRefresh = null;
    $scope.events = [];

    function getEvents() {
      //if (!authService.isLoggedIn()) { // if not logger in
      //  return; // do nothing
      //}

      myRest.getEvents().then(
        function (events) {
          $scope.events = angular.copy(events);
          // Start update
          stopAutoRefresh = $interval(function () {
            updateEvents();
          }, 5000);
        }
      );
    };

    getEvents();

    function updateEvents() {
      myRest.getEventsUpdate().then(
        function (newEvents) {
          log("events have been updated");
          // push new events to beginning of the list
          newEvents.forEach(function (event) {
            $scope.events.unshift(event);
          });

        }
      );
    }

    $scope.$on('$destroy', function() {
      if (stopAutoRefresh) {
        $interval.cancel(stopAutoRefresh);
      }
    });

    function log(msg) {
      $log.debug(msg);
    }

  });
