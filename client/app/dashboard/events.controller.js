'use strict';

angular.module('demoarmApp')
  .controller('EventsCtrl', function ($scope) {

    var events = [
      {
        id: 1,
        timestamp: moment().subtract(4, 'minutes').toDate(),
        card: 80365814,
        operation: 'пополнение',
        currency: 'баллы',
        value: 5,
        isSuccess: true
      },
      {
        id: 2,
        timestamp: moment().subtract(3, 'minutes').toDate(),
        card: 80365814,
        operation: 'списание',
        currency: 'баллы',
        value: 5,
        isSuccess: true
      },
      {
        id: 3,
        timestamp: moment().subtract(2, 'minutes').toDate(),
        card: 80365814,
        operation: 'пополнение',
        currency: 'баллы',
        value: 5,
        isSuccess: true
      },
      {
        id: 4,
        timestamp: moment().subtract(1, 'minutes').toDate(),
        card: 80365814,
        operation: 'списание',
        currency: 'баллы',
        value: 5,
        isSuccess: false
      }
    ];

    _(events).reverse();

    $scope.events = events;

  });
