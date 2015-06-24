'use strict';

describe('Controller: Dashboard2Ctrl', function () {

  // load the controller's module
  beforeEach(module('demoarmApp'));

  var Dashboard2Ctrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    Dashboard2Ctrl = $controller('Dashboard2Ctrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
