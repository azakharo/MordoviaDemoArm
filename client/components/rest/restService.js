'use strict';

var mod = angular.module('restService', []);

mod.service(
  "myRest",
  function ($http, $q, $log, $rootScope, $interval) {
    var baseURL = 'http://cp-prod.corp.sarov-itc.ru/';

    //$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa('admin:admin');
    $http.defaults.headers.common['Content-type'] = 'application/json';

    //=====================================================
    // PUBLIC METHODS

    function getAccounts() {
      var request = $http({
        method: "get",
        url: baseURL + "accounts"
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAccountBags(accountID) {
      var request = $http({
        method: "get",
        url: baseURL + format('accounts/{}/bags', accountID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAccountTransactions(accountID) {
      var request = $http({
        method: "get",
        url: baseURL + format('accounts/{}/transactions', accountID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getApps() {
      var request = $http({
        method: "get",
        url: baseURL + "applications"
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAppCurrencies(appID) {
      var request = $http({
        method: "get",
        url: baseURL + format('applications/{}/currencies', appID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getCurrencies() {
      var currencies = [];
      var deffered = $q.defer();

      getApps().then(
        function(srvApps) {
          if (srvApps.length === 0) {
            deffered.resolve(currencies);
          }
          var appID = srvApps[0].Id;
          getAppCurrencies(appID).then(
            function(srvCurrencies) {
              srvCurrencies.forEach(function (srvCurr) {
                var curr = {};
                curr.srvID = srvCurr.Id;
                curr.code = srvCurr.Code;
                curr.name = srvCurr.Info.Title;
                currencies.push(curr);
              });

              deffered.resolve(currencies);
            },
            function(reason) {
              deffered.reject(reason);
            }
          );

        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getCards(currencies) {
      var newCards = [];
      var deffered = $q.defer();

      getAccounts().then(
        function (srvAccounts) {
          var accInd = 0;
          srvAccounts.forEach(function (srvAcc) {
            var card = {};
            card.id = srvAcc.Number;
            card.srvAccountID = srvAcc.Id;

            // Request bags for the account
            card.bags = [];
            getAccountBags(srvAcc.Id).then(
              function (srvBags) {
                srvBags.forEach(function (srvBag) {
                  var bag = {};
                  bag.srvID = srvBag.Id;
                  bag.activePeriodStart = moment.unix(srvBag.TimeFrame.StartTimestamp);
                  bag.activePeriodFinish = moment.unix(srvBag.TimeFrame.FinishTimestamp);

                  // Get currency by its server id
                  bag.currency = _.find(currencies, function (curr) {
                    return curr.srvID === srvBag.CurrencyId;
                  });

                  // TODO Dummy balance
                  bag.balance = 0;

                  //log('bag');
                  card.bags.push(bag);
                });

                newCards.push(card);

                // if last card, then resolve
                if (accInd === srvAccounts.length - 1) {
                  //log('resolve');
                  deffered.resolve(newCards);
                }

                accInd += 1;
              });
          });

        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getAllTransactions() {
      var transactions = [];
      var deffered = $q.defer();

      getAccounts().then(
        function (srvAccounts) {
          var accInd = 0;
          srvAccounts.forEach(function (srvAcc) {
            // Request transactions for the account
            getAccountTransactions(srvAcc.Id).then(
              function (srvTransactions) {
                transactions = transactions.concat(srvTransactions);

                // if last account, then resolve
                if (accInd === srvAccounts.length - 1) {
                  // TODO sort by timestamp desc

                  //log('resolve');
                  deffered.resolve(transactions);
                }

                accInd += 1;
              });
          });
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    // **************************
    // dummy cards implementation

    //var cards = [
    //  {
    //    id: "80365814",
    //    bags: [
    //      {
    //        name: "баллы",
    //        balance: 100,
    //        activePeriod: "бессрочно"
    //      },
    //      {
    //        name: "разовые поездки",
    //        balance: 5,
    //        activePeriod: "10.05.2015-10.06.2015"
    //      },
    //      {
    //        name: "разовые поездки",
    //        balance: 5,
    //        activePeriod: "до 15.08.2015"
    //      },
    //    ]
    //  },
    //  {
    //    id: "80365815",
    //    bags: [
    //      {
    //        name: "разовые поездки",
    //        balance: 10,
    //        activePeriod: "бессрочно"
    //      }
    //    ]
    //  }
    //];

    //function getCards() {
      //var request = $http({
      //  method: "get",
      //  url: "api/cards"
      //});
      //return ( request.then(handleSuccess, handleError) );
    //}

    // maxInt exclusive
    function selectRandomInt(maxInt) {
      var rand = Math.random();
      rand *= maxInt;
      return Math.floor(rand);
    }

    // Simulate cards data update
    //$interval(function () {
    //  var card = cards[0];
    //  var bagIndex = selectRandomInt(card.bags.length);
    //  card.bags[bagIndex].balance += 5;
    //}, 5000);

    // dummy cards implementation
    // **************************

    // ++++++++++++++++++++++++++++++++++++++++++
    // dummy events impl-on

    //function getEvents() {
    //  var deffered = $q.defer();
    //
    //  var events = [
    //    {
    //      id: 1,
    //      timestamp: moment().subtract(4, 'minutes').toDate(),
    //      card: 80365814,
    //      operation: 'пополнение',
    //      currency: 'баллы',
    //      value: 5,
    //      isSuccess: true
    //    },
    //    {
    //      id: 2,
    //      timestamp: moment().subtract(3, 'minutes').toDate(),
    //      card: 80365814,
    //      operation: 'списание',
    //      currency: 'баллы',
    //      value: 5,
    //      isSuccess: true
    //    },
    //    {
    //      id: 3,
    //      timestamp: moment().subtract(2, 'minutes').toDate(),
    //      card: 80365814,
    //      operation: 'пополнение',
    //      currency: 'баллы',
    //      value: 5,
    //      isSuccess: true
    //    },
    //    {
    //      id: 4,
    //      timestamp: moment().subtract(1, 'minutes').toDate(),
    //      card: 80365814,
    //      operation: 'списание',
    //      currency: 'баллы',
    //      value: 5,
    //      isSuccess: false
    //    }
    //  ];
    //
    //  _(events).reverse();
    //
    //  deffered.resolve(events);
    //  return deffered.promise;
    //}
    //
    //var nextEventID = 5;
    //function getEventsUpdate() {
    //  var deffered = $q.defer();
    //  var newEvents = [];
    //
    //  var val = selectRandomInt(11);
    //  if (val === 0) {
    //    val = 1;
    //  }
    //
    //  var rand = Math.random();
    //  var oper = (rand < 0.5) ? 'списание' : 'пополнение';
    //
    //  var newEvent = {
    //    id: nextEventID,
    //    timestamp: new Date(),
    //    card: 80365814,
    //    operation: oper,
    //    currency: 'баллы',
    //    value: val,
    //    isSuccess: true
    //  };
    //  nextEventID += 1;
    //  newEvents.push(newEvent);
    //
    //  deffered.resolve(newEvents);
    //  return deffered.promise;
    //}

    // dummy events impl-on
    // ++++++++++++++++++++++++++++++++++++++++++

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

    function log(msg) {
      $log.debug(msg);
    }

    // PRIVATE METHODS
    //*************************************************************************

    // Return public API
    return ({
      getAccounts:      getAccounts,
      getAccountBags:   getAccountBags,
      getAccountTransactions: getAccountTransactions,
      getApps:          getApps,
      getAppCurrencies: getAppCurrencies,
      //getEvents:        getEvents,
      //getEventsUpdate:  getEventsUpdate,
      getAllTransactions: getAllTransactions,
      //-------------------------------------------------------------
      // methods which return app specific models (not server models)
      getCurrencies:    getCurrencies,
      getCards:         getCards
    });

  }
);
