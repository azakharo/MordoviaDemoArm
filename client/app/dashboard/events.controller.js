'use strict';

var mod = angular.module('demoarmApp');

mod.controller('EventsCtrl', function ($scope, $interval, $log, $q, myRest) {
  var stopAutoRefresh = null;
  $scope.events = [];

  function getEvents() {
    var deffered = $q.defer();
    myRest.getCurrencies().then(
      function (currencies) {
        //$scope.currencies = currencies;
        myRest.getCards(currencies).then(
          function (cards) {
            myRest.getAllTransactions().then(
              function (srvTransactions) {
                var events = [];
                var eventInd = 0;
                srvTransactions.forEach(function (srvTrans) {
                  var event = {};
                  event.id = eventInd + 1;
                  event.srvTransactionID = srvTrans.Id;
                  event.timestamp = moment.unix(srvTrans.Timestamp).toDate();
                  event.card = myRest.findCardByBagID(cards, srvTrans.BagId);
                  event.operation = srvTrans.Type;

                  var bag = myRest.findBag(cards, srvTrans.BagId);
                  if (bag) {
                    event.currency = bag.currency;
                  }

                  event.value = srvTrans.Value;
                  event.isSuccess = srvTrans.States[0].State === "Accepted";

                  events.push(event);
                  eventInd += 1;
                });

                deffered.resolve(events);
              },
              function (reason) {
                deffered.reject(reason)
              });
          },
          function (reason) {
            deffered.reject(reason)
          });
      },
      function (reason) {
        deffered.reject(reason)
      });
    return deffered.promise;
  }

  getEvents().then(function (events) {
    // Update the scope
    $scope.events = events;
    // Start auto update
    stopAutoRefresh = $interval(updateEvents, 5000);
    //log("Got events");
  });

  function updateEvents() {
    getEvents().then(function(newlyReceivedEvents){

      // Remove wasUpdated flags
      $scope.events.forEach(function (event) {
        event.wasUpdated = false;
      });

      // Find new events, set wasUpdated flag and add them to the beginning of the list
      var newEvents = [];
      _(newlyReceivedEvents).forEach(function(newlyRecvEvent) {
        var found = _($scope.events).find(function(oldEvent) {
          return oldEvent.srvTransactionID === newlyRecvEvent.srvTransactionID;
        });
        if (!found) {
          newEvents.push(newlyRecvEvent);
        }
        else {
          //log("no new events found");
          return false;
        }
      });
      if (newEvents.length > 0) {
        _(newEvents).reverse();
        newEvents.forEach(function (event) {
          event.wasUpdated = true;
          $scope.events.unshift(event);
        });
      }

      //log("Updated events");
    });
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
