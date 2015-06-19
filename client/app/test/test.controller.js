'use strict';

var mod = angular.module('demoarmApp')

mod.controller('TestCtrl', function ($scope) {
  $scope.vm = {};

  // The model object that we reference
  // on the  element in index.html
  $scope.vm.rental = {};

  // An array of our form fields with configuration
  // and options set. We make reference to this in
  // the 'fields' attribute on the  element
  $scope.vm.rentalFields = [
    {
      key: 'first_name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true
      }
    },
    {
      key: 'last_name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true
      }
    },
    {
      key: 'email',
      type: 'input',
      templateOptions: {
        type: 'email',
        label: 'Email address',
        placeholder: 'Enter email',
        required: true
      }
    },
  ];
});
