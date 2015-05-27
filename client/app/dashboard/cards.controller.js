'use strict';

var mod = angular.module('demoarmApp');

mod.controller('CardsCtrl', function ($scope, $interval, $log, $q, myRest) {
  $scope.cards = [];

  function getCurrencies() {
    var currencies = [];
    var deffered = $q.defer();

    myRest.getApps().then(
      function(srvApps) {
        if (srvApps.length === 0) {
          deffered.resolve(currencies);
        }
        var appID = srvApps[0].Id;
        myRest.getAppCurrencies(appID).then(
          function(srvCurrencies) {
            srvCurrencies.forEach(function (srvCurr) {
              var curr = {};
              curr.srvID = srvCurr.Id;
              curr.code = srvCurr.Code;
              curr.name = srvCurr.Info.Title;
              currencies.push(curr);
            });

            deffered.resolve(currencies);
          },
          function(reason) {
            deffered.reject(reason);
          }
        );

      },
      function(reason) {
        deffered.reject(reason);
      }
    );

    return deffered.promise;
  }

  function getCards(currencies) {
    var newCards = [];
    var deffered = $q.defer();

    myRest.getAccounts().then(
      function (srvAccounts) {
        var accInd = 0;
        srvAccounts.forEach(function (srvAcc) {
          var card = {};
          card.id = srvAcc.Number;
          card.srvAccountID = srvAcc.Id;

          // Request bags for the account
          card.bags = [];
          myRest.getAccountBags(srvAcc.Id).then(
            function (srvBags) {
              srvBags.forEach(function (srvBag) {
                var bag = {};
                bag.srvID = srvBag.Id;
                bag.activePeriodStart = moment.unix(srvBag.TimeFrame.StartTimestamp);
                bag.activePeriodFinish = moment.unix(srvBag.TimeFrame.FinishTimestamp);

                // Get currency by its server id
                bag.currency = _.find(currencies, function (curr) {
                  return curr.srvID === srvBag.CurrencyId;
                });

                //log('bag');
                card.bags.push(bag);
              });

              newCards.push(card);

              // if last card, then resolve
              if (accInd === srvAccounts.length - 1) {
                //log('resolve');
                deffered.resolve(newCards);
              }

              accInd += 1;
            });
        });

      },
      function (reason) {
        deffered.reject(reason);
      }
    );

    return deffered.promise;

    //myRest.getCards().then(
    //  function (cards) {
    //    // Find the bags which have been changed
    //    var cardsCopy = angular.copy(cards);
    //    if ($scope.cards.length > 0) {
    //      // TODO Assumed that only bag balances are changed
    //      for (var cardInd = 0; cardInd < cardsCopy.length; cardInd++) {
    //        var oldCard = $scope.cards[cardInd];
    //        var newCard = cardsCopy[cardInd];
    //        // Nothing changed in the card, skip
    //        if (angular.equals(oldCard, newCard)) {
    //          continue;
    //        }
    //        for (var bagInd = 0; bagInd < oldCard.bags.length; bagInd++) {
    //          var oldBag = oldCard.bags[bagInd];
    //          var newBag = newCard.bags[bagInd];
    //          if (oldBag.balance !== newBag.balance) {
    //            //log("card '" + oldCard.id + "', bag '" + oldBag.name + "': balance changed from " + oldBag.balance + " to " + newBag.balance);
    //            //log(format("card '{}', bag '{}': balance changed from {} to {}!", oldCard.id, oldBag.name, oldBag.balance, newBag.balance));
    //            newBag.wasUpdated = true;
    //          }
    //          else {
    //            newBag.wasUpdated = false;
    //          }
    //        }
    //      }
    //    }
    //
    //    // Update the scope
    //    $scope.cards = cardsCopy;
    //  }
    //);
  }

  getCurrencies().then(function(currencies){
    //$scope.currencies = currencies;
    getCards(currencies).then(function(newCards){
      // Update the scope
      $scope.cards = newCards;
    });
  });

  //var stopAutoRefresh = $interval(function () {
  //  updateCards();
  //}, 5000);
  //
  //$scope.$on('$destroy', function () {
  //  $interval.cancel(stopAutoRefresh);
  //});

  function log(msg) {
    $log.debug(msg);
  }

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
