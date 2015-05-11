'use strict';

angular.module('demoarmApp')
  .controller('TransactionsCtrl', function ($scope) {
    $scope.transactions = ['transaction 1', 'transaction 2', 'transaction 3'];
  });
