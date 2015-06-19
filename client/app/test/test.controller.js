'use strict';

var mod = angular.module('demoarmApp')

mod.controller('TestCtrl', function ($scope, $log, myRest) {
  $scope.userInput = {};

  $scope.formFields = [
    {
      key: 'turnover',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'New turnover value',
        placeholder: 'Enter integer',
        required: true
      }
    }
  ];

  $scope.onBtnClick = function() {
    myRest.postTurnover(moment(), +$scope.userInput.turnover);
  };

});
