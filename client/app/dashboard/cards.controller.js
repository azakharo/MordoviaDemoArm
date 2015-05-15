'use strict';

var mod = angular.module('demoarmApp');

mod.controller('CardsCtrl', function ($scope) {
  $scope.cards = [
    {
      id: "80365814",
      balance: 84,
      units: 'руб',
      isActive: true
    },
    {
      id: "80351196",
      balance: 149,
      units: 'руб',
      isActive: true
    },
    {
      id: "80247833",
      balance: -11,
      units: 'руб',
      isActive: false
    }
  ];

  var curID = 80247834;
  var curBalance = 7;
  // TODO make table scrollable
  for (var i = 0; i < 20; i++) {
    var newCard = {
      id: '' + curID,
      balance: curBalance,
      units: 'руб',
      isActive: true
    };
    $scope.cards.push(newCard);
    curID += 1;
    curBalance += 7;
  }

});

mod.filter('cardBalanceFilter', function () {
  return function (card) {
    var balance = card.balance ? card.balance : 0;
    var s = "" + balance;
    if (card.units) {
      s += " " + card.units;
    }
    return s;
  };
});
