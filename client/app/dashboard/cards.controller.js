'use strict';

var mod = angular.module('demoarmApp');

mod.controller('CardsCtrl', function ($scope, $interval, $log, myRest) {
  $scope.cards = [];

  function updateCards() {
    //if (!authService.isLoggedIn()) { // if not logger in
    //  return; // do nothing
    //}

    myRest.getCards().then(
      function (cards) {
        //if (!angular.equals(cards, $scope.cards)) { // update only if needed
          //$log.debug("cards have been updated");

          // Find the bags which have been changed
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
        //}
      }
    );
  };
  updateCards();

  var stopAutoRefresh = $interval(function () {
    updateCards();
  }, 5000);

  $scope.$on('$destroy', function() {
    $interval.cancel(stopAutoRefresh);
  });

  function log(msg) {
    $log.debug(msg);
  }

});
