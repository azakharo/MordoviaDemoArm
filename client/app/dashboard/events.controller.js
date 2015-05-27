'use strict';

var mod = angular.module('demoarmApp');

mod.controller('EventsCtrl', function ($scope, $interval, $log, myRest) {
  //var stopAutoRefresh = null;
  $scope.events = [];

  myRest.getCurrencies().then(function(currencies){
    //$scope.currencies = currencies;
    myRest.getCards(currencies).then(function(cards){
      myRest.getAllTransactions().then(function(srvTransactions){
        var events = [];
        var eventInd = 0;
        srvTransactions.forEach(function (srvTrans) {
          var event = {};
          event.id = eventInd + 1;
          event.srvTransactionID = srvTrans.Id;
          event.timestamp = moment.unix(srvTrans.Timestamp).toDate();
          event.card = "card";
          event.operation = srvTrans.Type;
          event.currency = _.find(currencies, function (curr) {
            return curr.code === srvTrans.SourcePayload.CurrencyCode;
          });
          event.value = srvTrans.Value;
          event.isSuccess = (srvTrans.States[0].State === "Accepted") ? true : false;

          events.push(event);
          eventInd += 1;
        });

        // Update the scope
        $scope.events = events;
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
