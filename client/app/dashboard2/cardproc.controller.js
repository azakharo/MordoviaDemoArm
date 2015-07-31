'use strict';

var mod = angular.module('demoarmApp');

mod.controller('CardProcCtrl', function ($scope, $interval, $log, $q, myRest) {
  $scope.cards = [];

  myRest.getCurrencies().then(function(currencies){
    //$scope.currencies = currencies;
    myRest.getCards(currencies).then(function(newCards){
      // Calc bag balances
      myRest.getEvents().then(function(events) {
        myRest.calcBalance(newCards, events);
        myRest.calcTransactions(newCards, events);

        //var firstCard = newCards[0];
        //var copies = _.times(9, function(ind) {
        //  var copy = angular.copy(firstCard);
        //  copy.id += ind + 1;
        //  copy.latestTrans.timestamp.add(ind + 1, 'minutes');
        //  return copy;
        //});
        //newCards = newCards.concat(copies);

        // Sort cards by latest trans time desc
        newCards = _.sortBy(newCards, function(card) {
          return (card.latestTrans) ? -card.latestTrans.timestamp : 0;
        });

        // Update the scope
        $scope.cards = newCards;
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

          //var firstCard = cards[0];
          //var copies = _.times(9, function(ind) {
          //  var copy = angular.copy(firstCard);
          //  copy.id += ind + 1;
          //  copy.latestTrans.timestamp.add(ind + 1, 'minutes');
          //  return copy;
          //});
          //cards = cards.concat(copies);

          // Sort cards by latest trans time desc
          cards = _.sortBy(cards, function(card) {
            return (card.latestTrans) ? -card.latestTrans.timestamp : 0;
          });

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
                if (oldBag && newBag) {
                  if (oldBag.balance !== newBag.balance) {
                    //log("card '" + oldCard.id + "', bag '" + oldBag.name + "': balance changed from " + oldBag.balance + " to " + newBag.balance);
                    //log(format("card '{}', bag '{}': balance changed from {} to {}!", oldCard.id, oldBag.name, oldBag.balance, newBag.balance));
                    newBag.wasUpdated = true;
                    newCard.justChanged = true;
                  }
                  else {
                    newBag.wasUpdated = false;
                  }
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

mod.filter('cardTitleFilter', function () {
  return function (card) {
    // UID: 1234567890 (ЕСЭК)
    var s = format('UID: {}', card.id);
    if (card.isESEK) {
      s += " (ЕСЭК)"
    }
    return s;
  };
});
