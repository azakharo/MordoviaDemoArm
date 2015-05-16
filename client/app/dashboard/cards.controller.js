'use strict';

var mod = angular.module('demoarmApp');

mod.controller('CardsCtrl', function ($scope) {
  $scope.cards = [
    {
      id: "80365814",
      bags: [
        {
          name: "баллы",
          balance: 100,
          activePeriod: "бессрочно"
        },
        {
          name: "разовые поездки",
          balance: 5,
          activePeriod: "10.05.2015-10.06.2015"
        },
        {
          name: "разовые поездки",
          balance: 5,
          activePeriod: "до 15.08.2015"
        },
      ]
    },
    {
      id: "80365815",
      bags: [
        {
          name: "разовые поездки",
          balance: 10,
          activePeriod: "бессрочно"
        }
      ]
    },
  ];

});
