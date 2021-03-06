'use strict';

var mod = angular.module('restService', []);

mod.service(
  "myRest",
  function ($http, $q, $log, $rootScope, $interval, $window) {
    var baseURL = 'http://cp.sarov-itc.ru/api/cp/v1/';
    function getBaseURL() {
      return baseURL;
    }

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

    function getAccountMedias(accountID) {
      var request = $http({
        method: "get",
        url: baseURL + format('accounts/{}/medias', accountID)
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

    function getAllTransactions() {
      var transactions = [];
      var deffered = $q.defer();

      getAccounts().then(
        function (srvAccounts) {
          var accInd = 0;
          srvAccounts.forEach(function (srvAcc) {
            // Request transactions for the account
            getAccountTransactions(srvAcc.id).then(
              function (srvTransactions) {
                transactions = transactions.concat(srvTransactions);

                // if last account, then resolve
                if (accInd === srvAccounts.length - 1) {
                  // sort by timestamp desc
                  transactions = _.sortBy(transactions, function (trans) {
                    return -trans.timestamp;
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

    function getOrgs() {
      var request = $http({
        method: "get",
        url: baseURL + 'providers'
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getVehicles() {
      var request = $http({
        method: "get",
        url: baseURL + 'vehicles'
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getVehicleTurnover(vehicleID) {
      var request = $http({
        method: "get",
        url: baseURL + format('vehicles/{}/turnovers', vehicleID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    //************************************************************************************
    // Below are methods which return or work with app specific models (not server models)

    function getCurrencies() {
      var currencies = [];
      var deffered = $q.defer();

      getApps().then(
        function(srvApps) {
          if (srvApps.length === 0) {
            deffered.resolve(currencies);
          }
          var appID = srvApps[0].id;
          getAppCurrencies(appID).then(
            function(srvCurrencies) {
              srvCurrencies.forEach(function (srvCurr) {
                var curr = {};
                curr.srvID = srvCurr.id;
                curr.code = srvCurr.symbol;
                curr.name = srvCurr.description;
                curr.privilege = (srvCurr.exemptionOUId !== null) ? "есть льгота" : 'unprivileged';
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
            card.id = +srvAcc.number;
            card.srvAccountID = srvAcc.id;
            // TODO use real card state here
            card.state = "success";

            card.isESEK = srvAcc.userId !== undefined && srvAcc.userId !== null;

            // Request bags for the account
            card.bags = [];
            getAccountMedias(srvAcc.id).then(
              function(medias) {
                if (medias && medias.length > 0) {
                  // Get 1st media
                  // Get card RFID
                  var media = medias[0];
                  card.RFID = media.rfid;
                  // Find card activation time
                  var stateActivated = _(media.states).find(function(state) {
                    return state.state === "activated";
                  });
                  if (stateActivated) {
                    card.activatedAt = moment.unix(stateActivated.timestamp);
                  }
                } // if media found
                getAccountBags(srvAcc.id).then(
                  function (srvBags) {
                    srvBags.forEach(function (srvBag) {
                      var bag = {};
                      bag.srvID = srvBag.id;
                      bag.activePeriodStart = moment.unix(srvBag.timeframe.startTimestamp);
                      bag.activePeriodFinish = moment.unix(srvBag.timeframe.finishTimestamp);

                      // Get currency by its server id
                      bag.currency = _.find(currencies, function (curr) {
                        return curr.srvID === srvBag.currencyId;
                      });

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
          });
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function findCardBySrvID(cards, srvID) {
      var card2ret = undefined;
      _(cards).forEach(function(card) {
        if (card.srvID === srvID) {
          card2ret = card;
          return false;
        }
      });
      return card2ret;
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

    function findCardBag(card, srvBagID) {
      var bag2ret = undefined;
      _(card.bags).forEach(function(bag) {
        if (bag.srvID === srvBagID) {
          bag2ret = bag;
          return false;
        }
      });
      return bag2ret;
    }

    function getEvents() {
      var deffered = $q.defer();
      getCurrencies().then(
        function (currencies) {
          //$scope.currencies = currencies;
          getCards(currencies).then(
            function (cards) {
              getAllTransactions().then(
                function (srvTransactions) {
                  var events = [];
                  var eventInd = 0;
                  srvTransactions.forEach(function (srvTrans) {
                    var event = {};
                    event.id = eventInd + 1;
                    event.srvTransactionID = srvTrans.id;
                    event.timestamp = moment.unix(srvTrans.timestamp);
                    event.card = findCardByBagID(cards, srvTrans.bagId);
                    event.bag = findBag(cards, srvTrans.bagId);
                    event.operation = srvTrans.type;

                    var bag = findBag(cards, srvTrans.bagId);
                    if (bag) {
                      event.currency = bag.currency;
                    }

                    event.value = srvTrans.value;
                    event.isSuccess = srvTrans.status === "valid";

                    events.push(event);
                    eventInd += 1;
                  });

                  deffered.resolve(events);
                },
                function (reason) {
                  deffered.reject(reason)
                });
            },
            function (reason) {
              deffered.reject(reason)
            });
        },
        function (reason) {
          deffered.reject(reason)
        });
      return deffered.promise;
    }

    function calcBalance(cards, events) {
      cards.forEach(function(card){
        card.bags.forEach(function (bag) {
          // Get events for the bag
          var bagEvents = _.filter(events, function(evt) {
            return evt.bag.srvID === bag.srvID;
          });
          // Calc balance
          var balance = 0;
          bagEvents.forEach(function(bagEvt){
            if (bagEvt.operation === "replenishment") {
              balance += bagEvt.value;
            }
            else if (bagEvt.operation === "payment") {
              balance -= bagEvt.value;
            }
          });
          // Set balance to the bag
          bag.balance = balance;
        })
      });
    }

    // 1. for every card bag find total transaction count
    // 2. for every card find latest transaction
    // 3. find bag with latest transaction, set isLatestTrans flag for it
    function calcTransactions(cards, events) {
      cards.forEach(function(card){
        card.bags.forEach(function (bag) {
          /* For every card bag find total transaction count */
          // Get events for the bag
          var bagTrans = _.filter(events, function (evt) {
            return evt.bag.srvID === bag.srvID;
          });

          // Set bag transaction count
          if (bagTrans && bagTrans.length > 0) {
            bag.transCount = bagTrans.length;
          }
          else {
            bag.transCount = 0;
          }
        });


        /* For every card find latest transaction */

        // Get events for the card
        var cardTrans = _.filter(events, function (evt) {
          return evt.card.srvAccountID === card.srvAccountID;
        });

        // Sort by timestamp descending
        // Already sorted

        // Get 1st
        // Set card latest transaction
        if (cardTrans && cardTrans.length > 0) {
          card.latestTrans = cardTrans[0];
        }
        else {
          card.latestTrans = undefined;
        }

        // Find bag of the latest transaction
        if (card.latestTrans) {
          var latestBag = _.find(card.bags, function(bag) {
            return bag.srvID === card.latestTrans.bag.srvID;
          });
          if (latestBag) {
            latestBag.isLatestTrans = true;
          }
        }

      });
    }

    // Returns int
    function getTurnover() {
      var turnover = undefined;
      var deffered = $q.defer();

      getVehicles().then(
        function(vehicles) {
          if (vehicles.length === 0) {
            deffered.resolve(turnover);
            return;
          }
          var vehicle = vehicles[0];
          getVehicleTurnover(vehicle.id).then(
            function(srvTurnovers) {
              if (srvTurnovers.length === 0) {
                deffered.resolve(turnover);
                return;
              }
              // Get last and return quantity
              var lastSrvTurnover = srvTurnovers[srvTurnovers.length - 1];
              deffered.resolve(lastSrvTurnover.quantity);
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

    // Returns array: timestamp, value
    function getTurnoverHistory() {
      var hist = [];
      var deffered = $q.defer();

      getVehicles().then(
        function(vehicles) {
          if (vehicles.length === 0) {
            deffered.resolve(hist);
          }
          var vehicle = vehicles[0];
          getVehicleTurnover(vehicle.id).then(
            function(srvTurnovers) {
              if (srvTurnovers.length === 0) {
                deffered.resolve(hist);
              }

              // Get last and return quantity
              _(srvTurnovers).forEach(function(to) {
                var turno = {};
                turno.timestamp = moment.unix(to.timestamp);
                turno.value = to.quantity;
                hist.push(turno);
              });
              deffered.resolve(hist);
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

    // PUBLIC METHODS
    //=====================================================


    //*************************************************************************
    // PRIVATE METHODS

    function handleError(response) {
      if (response.status == 502 || response.status == 503 || response.status == 0) {
        $rootScope.isRestUnavailable = true;
      }
      else {
        if ($rootScope.isRestUnavailable) {
          $rootScope.isRestUnavailable = false;
          $window.location.reload();
        }
        else {
          $rootScope.isRestUnavailable = false;
        }
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

    //--------------------------------------------------
    // methods necessary only for the testing, debugging

    function postTurnover(timestamp, value) {
      var request = $http({
        method: "post",
        url: baseURL + 'vehicles/1/turnovers',
        data: [{
          "timeframe": {
            "startTimestamp": timestamp.unix() - 1000,
            "finishTimestamp": timestamp.unix()
          },
          "distance": 1000,
          "quantity": value
          }]
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function replenishBalance(timestamp, value) {
      var request = $http({
        method: "post",
        url: baseURL + 'replenishment',
        data: {
          "symbol":"TCK",
          "rfid": "1111-2222-3333-4444",
          "timestamp": timestamp.unix(),
          "value": value
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function makePayment(timestamp) {
      var request = $http({
        method: "post",
        url: baseURL + 'payment',
        data: {
          "rfid": "1111-2222-3333-4444",
          "timestamp": timestamp.unix(),
          "serviceId": 3,
          "applicationId": 3,
          "providerId": 4
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    // methods necessary only for the testing, debugging
    //--------------------------------------------------

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
      findCardBySrvID:  findCardBySrvID,
      findCardByBagID:  findCardByBagID,
      findCardBag:      findCardBag,
      findBag:          findBag,
      getEvents:        getEvents,
      calcBalance:      calcBalance,
      calcTransactions: calcTransactions,
      getTurnover:      getTurnover,
      getTurnoverHistory: getTurnoverHistory,
      // methods necessary only for the testing, debugging
      postTurnover:     postTurnover,
      replenishBalance: replenishBalance,
      makePayment:      makePayment,
      // just helper
      getBaseURL: getBaseURL
    });
  }
);
