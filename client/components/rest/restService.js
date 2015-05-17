'use strict';

var mod = angular.module('restService', []);

mod.service(
  "myRest",
  function ($http, $q, $log, $rootScope, $interval) {

    //$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa('admin:admin');
    $http.defaults.headers.common['Content-type'] = 'application/json';

    //=====================================================
    // PUBLIC METHODS

    // dummy cards implementation
    var cards = [
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
      }
    ];

    function getCards() {
      //var request = $http({
      //  method: "get",
      //  url: "api/cards"
      //});
      //return ( request.then(handleSuccess, handleError) );

      // dummy impl-on
      var deffered = $q.defer();
      deffered.resolve(cards);
      return deffered.promise;
    }

    // Simulate cards data update
    $interval(function () {
      var card = cards[0];
      card.bags[0].balance += 5;
    }, 5000);

    // PUBLIC METHODS
    //=====================================================


    //*************************************************************************
    // PRIVATE METHODS

    function handleError(response) {
      if (response.status == 503 || response.status == 0) {
        $rootScope.isRestUnavailable = true;
      }
      else {
        $rootScope.isRestUnavailable = false;
      }
      // The API response from the server should be returned in a
      // normalized format. However, if the request was not handled by the
      // server (or what not handles properly - ex. server error), then we
      // may have to normalize it on our end, as best we can.
      if (!angular.isObject(response.data) || !response.data.message) {
        return ( $q.reject("An unknown error occurred.") );
      }
      // Otherwise, use expected error message.
      return ( $q.reject(response.data.message) );
    }

    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess(response) {
      $rootScope.isRestUnavailable = false;
      return ( response.data );
    }

    // PRIVATE METHODS
    //*************************************************************************

    // Return public API
    return ({
      getCards: getCards
    });

  }
);
