'use strict';

angular.module('demoarmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('dashboard', {
        abstract: true,
        url: '/dashboard',
        templateUrl: 'app/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .state('dashboard.ready', {
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
          'transactions': {
            templateUrl: 'app/dashboard/transactions.html',
            controller: 'TransactionsCtrl'
          },
          'flow': {
            templateUrl: 'app/dashboard/flow.html',
            controller: 'FlowCtrl'
          }
        }
      });
  });
