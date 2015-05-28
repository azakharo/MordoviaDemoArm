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
                  // sort by timestamp desc
                  transactions = _.sortBy(transactions, function (trans) {
                    return -trans.Timestamp;
                  });

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

    function findCardByBagID(cards, srvBagID) {
      var card2ret = undefined;
      _(cards).forEach(function(card) {
        _(card.bags).forEach(function(bag) {
          if (bag.srvID === srvBagID) {
            card2ret = card;
            return false;
          }
        });
        if (card2ret) {
          return false;
        }
      });
      return card2ret;
    }

    function findBag(cards, srvBagID) {
      var bag2ret = undefined;
      _(cards).forEach(function(card) {
        _(card.bags).forEach(function(bag) {
          if (bag.srvID === srvBagID) {
            bag2ret = bag;
            return false;
          }
        });
        if (bag2ret) {
          return false;
        }
      });
      return bag2ret;
    }

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
      getAllTransactions: getAllTransactions,
      //-------------------------------------------------------------
      // methods which return app specific models (not server models)
      getCurrencies:    getCurrencies,
      getCards:         getCards,
      findCardByBagID:  findCardByBagID,
      findBag:          findBag
    });
  }
);
