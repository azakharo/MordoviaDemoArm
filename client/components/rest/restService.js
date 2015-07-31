'use strict';

var mod = angular.module('restService', []);

mod.service(
  "myRest",
  function ($http, $q, $log, $rootScope, $interval, $window) {
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

    function getOrgs() {
      var request = $http({
        method: "get",
        url: baseURL + 'organizations'
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getOrgVehicles(orgID) {
      var request = $http({
        method: "get",
        url: baseURL + format('organizations/{}/vehicles', orgID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getOrgVehicleTurnover(orgID, vehicleID) {
      var request = $http({
        method: "get",
        url: baseURL + format('organizations/{}/vehicles/{}/turnovers', orgID, vehicleID)
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
          var appID = srvApps[0].Id;
          getAppCurrencies(appID).then(
            function(srvCurrencies) {
              srvCurrencies.forEach(function (srvCurr) {
                var curr = {};
                curr.srvID = srvCurr.Id;
                curr.code = srvCurr.Code;
                curr.name = srvCurr.Info.Title;
                curr.privilege = (srvCurr.Exemption) ? srvCurr.Exemption : 'unprivileged';
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
            card.id = +srvAcc.Number;
            card.srvAccountID = srvAcc.Id;
            // TODO use real card state here
            card.state = "success";

            card.isESEK = srvAcc.UserId !== undefined && srvAcc.UserId !== null;

            // Request bags for the account
            card.bags = [];
            getAccountMedias(srvAcc.Id).then(
              function(medias) {
                if (medias && medias.length > 0) {
                  // Get 1st media
                  // Get card RFID
                  var media = medias[0];
                  card.RFID = media.RFID;
                  // Find card activation time
                  var stateActivated = _(media.States).find(function(state) {
                    return state.State === "Activated";
                  });
                  if (stateActivated) {
                    card.activatedAt = moment.unix(stateActivated.Timestamp);
                  }
                } // if media found
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
                    event.srvTransactionID = srvTrans.Id;
                    event.timestamp = moment.unix(srvTrans.Timestamp);
                    event.card = findCardByBagID(cards, srvTrans.BagId);
                    event.bag = findBag(cards, srvTrans.BagId);
                    event.operation = srvTrans.Type;

                    var bag = findBag(cards, srvTrans.BagId);
                    if (bag) {
                      event.currency = bag.currency;
                    }

                    event.value = srvTrans.Value;
                    event.isSuccess = srvTrans.States[0].State === "Accepted";

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

      getOrgs().then(
        function(orgs) {
          if (orgs.length === 0) {
            deffered.resolve(turnover);
            return;
          }
          var org = orgs[0];
          getOrgVehicles(org.Id).then(
            function(vehicles) {
              if (vehicles.length === 0) {
                deffered.resolve(turnover);
                return;
              }
              var vehicle = vehicles[0];
              getOrgVehicleTurnover(org.Id, vehicle.Id).then(
                function(srvTurnovers) {
                  if (srvTurnovers.length === 0) {
                    deffered.resolve(turnover);
                    return;
                  }
                  // Get last and return quantity
                  var lastSrvTurnover = srvTurnovers[srvTurnovers.length - 1];
                  deffered.resolve(lastSrvTurnover.Quantity);
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

      getOrgs().then(
        function(orgs) {
          if (orgs.length === 0) {
            deffered.resolve(hist);
          }
          var org = orgs[0];
          getOrgVehicles(org.Id).then(
            function(vehicles) {
              if (vehicles.length === 0) {
                deffered.resolve(hist);
              }
              var vehicle = vehicles[0];
              getOrgVehicleTurnover(org.Id, vehicle.Id).then(
                function(srvTurnovers) {
                  if (srvTurnovers.length === 0) {
                    deffered.resolve(hist);
                  }

                  // Get last and return quantity
                  _(srvTurnovers).forEach(function(to) {
                    var turno = {};
                    turno.timestamp = moment.unix(to.Timestamp);
                    turno.value = to.Quantity;
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
        url: baseURL + 'organizations/55643625c98e560001000001/vehicles/5566ee65ffa2621d995c1e1a/turnovers',
        data: [{
          "Timestamp": timestamp.unix(),
          "Distance": 1000,
          "Quantity": value
          }]
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function replenishBalance(timestamp, value) {
      var request = $http({
        method: "post",
        url: baseURL + 'replenishment',
        data: {
          "CurrencyCode": "TR-BL",
          "RFID": "1111-2222-3333-4444",
          "Timestamp": timestamp.unix(),
          "Value": value
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function makePayment(timestamp) {
      var request = $http({
        method: "post",
        url: baseURL + 'payment',
        data: {
          "RFID": "1111-2222-3333-4444",
          "Timestamp": timestamp.unix(),
          "ServiceId": "556436c457ab120001000001",
          "ApplicationId": "55643649dade7e0001000001",
          "OrganizationId": "55643625c98e560001000001"
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
      findCardByBagID:  findCardByBagID,
      findBag:          findBag,
      getEvents:        getEvents,
      calcBalance:      calcBalance,
      calcTransactions: calcTransactions,
      getTurnover:      getTurnover,
      getTurnoverHistory: getTurnoverHistory,
      // methods necessary only for the testing, debugging
      postTurnover:     postTurnover,
      replenishBalance: replenishBalance,
      makePayment:      makePayment
    });
  }
);
