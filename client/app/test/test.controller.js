'use strict';

var mod = angular.module('demoarmApp')

mod.controller('TestCtrl', function ($scope, $log, myRest) {
  $scope.userInput = {};

  $scope.formFields = [
    {
      key: 'turnover',
      type: 'input',
      templateOptions: {
        type: 'number',
        min: 0,
        label: 'New turnover value',
        placeholder: 'Enter integer',
        required: false
      }
    },
    {
      key: 'balanceAdd',
      type: 'input',
      templateOptions: {
        type: 'number',
        min: 0,
        label: 'Balance Addition',
        placeholder: 'Enter positive integer',
        required: false
      }
    }
  ];

  $scope.onPostTurnoverBtnClick = function() {
    myRest.postTurnover(moment(), $scope.userInput.turnover);
    $scope.userInput.turnover = undefined;
  };

  $scope.onReplenishBalanceBtnClick = function() {
    myRest.replenishBalance(moment(), $scope.userInput.balanceAdd);
    $scope.userInput.balanceAdd = undefined;
  };

});
