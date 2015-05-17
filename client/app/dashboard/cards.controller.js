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
        if (!angular.equals(cards, $scope.cards)) { // update only if needed
          //$log.debug("cards have been updated");
          $scope.cards = angular.copy(cards);
        }
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

});
