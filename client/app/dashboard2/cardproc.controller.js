'use strict';

var mod = angular.module('demoarmApp');

mod.controller('CardProcCtrl', function ($scope, $interval, $log, $q, myRest) {
  $scope.cards = [];

  myRest.getCurrencies().then(function(currencies){
    //$scope.currencies = currencies;
    myRest.getCards(currencies).then(function(newCards){
      // Update the scope
      $scope.cards = newCards;
      // Calc bag balances
      myRest.getEvents().then(function(events) {
        myRest.calcBalance($scope.cards, events);
        myRest.calcTransactions($scope.cards, events);


        var firstCard = $scope.cards[0];
        var copies = _.times(9, function(ind) {
          return angular.copy(firstCard);
        });
        $scope.cards = $scope.cards.concat(copies);
      });
    });
  });

  var stopAutoRefresh = $interval(function () {
    myRest.getCurrencies().then(function(currencies){
      //$scope.currencies = currencies;
      myRest.getCards(currencies).then(function(cards){
        // Calc bag balances
        myRest.getEvents().then(function(events) {
          myRest.calcBalance(cards, events);
          myRest.calcTransactions(cards, events);


          var firstCard = cards[0];
          var copies = _.times(9, function(ind) {
            return angular.copy(firstCard);
          });
          cards = cards.concat(copies);


          // Find the bags which have been changed, and animate the change
          var cardsCopy = angular.copy(cards);
          if ($scope.cards.length > 0) {
            // TODO Assumed that only bag balances are changed
            for (var cardInd = 0; cardInd < cardsCopy.length; cardInd++) {
              var oldCard = $scope.cards[cardInd];
              var newCard = cardsCopy[cardInd];
              // Nothing changed in the card, skip
              if (angular.equals(oldCard, newCard)) {
                continue;
              }
              for (var bagInd = 0; bagInd < oldCard.bags.length; bagInd++) {
                var oldBag = oldCard.bags[bagInd];
                var newBag = newCard.bags[bagInd];
                if (oldBag.balance !== newBag.balance) {
                  //log("card '" + oldCard.id + "', bag '" + oldBag.name + "': balance changed from " + oldBag.balance + " to " + newBag.balance);
                  //log(format("card '{}', bag '{}': balance changed from {} to {}!", oldCard.id, oldBag.name, oldBag.balance, newBag.balance));
                  newBag.wasUpdated = true;
                }
                else {
                  newBag.wasUpdated = false;
                }
              }
            }
          }

          // Update the scope
          $scope.cards = cardsCopy;
        });
      });
    });
  }, 5000);

  $scope.$on('$destroy', function () {
    $interval.cancel(stopAutoRefresh);
  });

  function log(msg) {
    $log.debug(msg);
  }

  var cardState2PanelCls = {
    "success":  "panel-primary",
    "warning":  "panel-warning",
    "danger":   "panel-danger"
  };

  $scope.getCardPanelClass = function(cardState) {
    return cardState2PanelCls[cardState];
  };

});

mod.filter('bagActivePeriodFilter', function () {
  return function (bag) {
    var start = "";
    var finish = "";
    var dateFrmt = 'DD.MM.YYYY';
    if (bag.activePeriodStart) {
      start = bag.activePeriodStart.format(dateFrmt);
    }
    if (bag.activePeriodFinish) {
      finish = bag.activePeriodFinish.format(dateFrmt);
    }
    return format("{} - {}", start, finish);
  };
});

//mod.filter('cardLatestTransFilter', function () {
//  return function (trans) {
//    var s = "";
//    if (trans) {
//      var dtFrmt = 'DD.MM.YYYY HH:mm:ss';
//      var dt = trans.timestamp.format(dtFrmt);
//      s = format('{} | {} | {} | {}', dt, trans.currency.name, "oper", trans.value);
//    }
//    return s;
//  };
//});
