'use strict';

var mod = angular.module('demoarmApp');

mod.controller('EventsCtrl', function ($scope, $interval, $log, myRest) {
  //var stopAutoRefresh = null;
  $scope.events = [];

  myRest.getCurrencies().then(function(currencies){
    //$scope.currencies = currencies;
    myRest.getCards(currencies).then(function(cards){
      myRest.getAllTransactions().then(function(srvTransactions){
        //$scope.transactions = srvTransactions;
        // TODO Update the scope
        log("DONE");
      });
    });
  });

  //function getEvents() {
  //  //if (!authService.isLoggedIn()) { // if not logger in
  //  //  return; // do nothing
  //  //}
  //
  //  myRest.getEvents().then(
  //    function (events) {
  //      $scope.events = angular.copy(events);
  //      // Start update
  //      stopAutoRefresh = $interval(function () {
  //        updateEvents();
  //      }, 5000);
  //    }
  //  );
  //};
  //
  //getEvents();

  //function updateEvents() {
  //  myRest.getEventsUpdate().then(
  //    function (newEvents) {
  //      //log("events have been updated");
  //
  //      // Remove wasUpdated flags
  //      $scope.events.forEach(function (event) {
  //        event.wasUpdated = false;
  //      });
  //
  //      // Add the new events to the scope
  //      var eventsCopy = angular.copy(newEvents);
  //      // push new events to beginning of the list
  //      eventsCopy.forEach(function (event) {
  //        event.wasUpdated = true;
  //        $scope.events.unshift(event);
  //      });
  //
  //    }
  //  );
  //}
  //
  //$scope.$on('$destroy', function() {
  //  if (stopAutoRefresh) {
  //    $interval.cancel(stopAutoRefresh);
  //  }
  //});

  function log(msg) {
    $log.debug(msg);
  }

});
