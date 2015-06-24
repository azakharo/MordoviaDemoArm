'use strict';

angular.module('demoarmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('dashboard2', {
        abstract: true,
        url: '/dashboard2',
        templateUrl: 'app/dashboard2/dashboard2.html',
        controller: 'Dashboard2Ctrl'
      })
      .state('dashboard2.ready', {
        url: '/preview',
        views: {
          'cards': {
            templateUrl: 'app/dashboard/cards.html',
            controller: 'CardsCtrl'
          },
          'turnover': {
            templateUrl: 'app/dashboard/turnover.html',
            controller: 'TurnoverCtrl'
          },
          'events': {
            templateUrl: 'app/dashboard/events.html',
            controller: 'EventsCtrl'
          },
          'flow': {
            templateUrl: 'app/dashboard/flow.html',
            controller: 'FlowCtrl'
          }
        }
      });
  });
