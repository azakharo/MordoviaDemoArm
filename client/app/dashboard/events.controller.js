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
          event.card = findCardByBagID(cards, srvTrans.BagId);
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

  function findCardByBagID(cards, srvBagID) {
    var card2ret = undefined;
    _(cards).forEach(function(card) {
      _(card.bags).forEach(function(bag) {
        if (bag.srvID === srvBagID) {
          card2ret = card;
          return false;
        }
      });
      if (card2ret) {
        return false;
      }
    });
    return card2ret;
  }

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

mod.filter('eventOperationFilter', function () {
  return function (operation) {
    var oper = "неизвестная";
    if (operation === "replenishment") {
      oper = "пополнение";
    }
    else if (operation === "payment") {
      oper = "списание";
    }
    return oper;
  };
});
