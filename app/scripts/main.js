if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
};

const data = {
  loadStatus: null,
  investPopup: false,
  currenciesList: [],
  myInvestments: [],
  investTemplate: {
    "id": null,
    "cryptoInvestedAmount": null,
    "cryptoInvestedSymbol": null,
    "usdInvested": null,
    "coinsAmount": null,
    "coinsSymbol": null,
    "investName": null
  },
  rates: {
    btc: 0,
    eth: 0,
    ltc: 0,
    eos: 0,
    skin: 0,
    ping: 0,
    plbt: 0,
    wtt: 0,
    xtz: 0,
    nvst: 0,
    dim: 0
  }
};

const app = new Vue({
  el: "#crypto-app",
  data() {
    return data;
  },

  methods: {
    fetchData: function() {
      const request = new XMLHttpRequest();
      var json, self = this;

      request.open('GET', 'https://api.coinmarketcap.com/v1/ticker/', true);
      request.send();

      request.onreadystatechange = function() {
        if (request.readyState != 4) {
          self.loadStatus = "Loading...";

          return;
        }

        if (this.status != 200) {
          self.loadStatus = "Error!";
          console.log( request.status + ': ' + request.statusText );
        } else {
          try {
            json = JSON.parse(request.responseText)

            self.setRates(json);
            self.getCurrencies(json);
          } catch (e) {
            console.log("Wrong response " + e.message);
          }
        }
      }
    },

    createInvestment: function() {
      this.investTemplate.id = Date.now();

      this.myInvestments.push(this.investTemplate);

      for (key in this.investTemplate) {
        this.investTemplate[key] = null;
      }

      this.saveToLS();
    },

    getMyInvestments: function() {
      this.myInvestments = JSON.parse("myInvestments");
    },

    savetoLS: function() {
      localStorage.setItem("myInvestments", JSON.stringify(this.myInvestments));
    },

    getCurrencies: function(json) {
      this.loadStatus = "Get currencies list...";

      json.forEach((item) => {
        let currency = {};
        currency["name"] = item["name"];
        currency["symbol"] = item["symbol"];

        this.currenciesList.push(currency);
      });

      this.loadStatus = null;
    },

    setRates: function(json) {
      this.loadStatus = "Processing rates...";

      for(currency in this.rates) {
        json.forEach((item) => {
          if(item["symbol"].toLowerCase() === currency) {
            this.rates["" + currency] = item["price_usd"];
          }
        });
      }

      this.loadStatus = null;
    },

    closeWindow: function(e) {
      if(e.target.matches('.popup-overlay') || e.target.matches('.popup__close')) {
        this.investPopup = false;
      }
    },

    openWindow: function(e) {
      this.investPopup = true;

      setTimeout(function() {
        if(e.target.matches('button, button *')) document.querySelector('.popup-overlay').focus();
      }, 200);
    }
  },

  created: function() {
    this.getMyInvestments();
    this.fetchData();

    console.log('App created...');
  },
});

// if ('serviceWorker' in navigator) {
//   // Delay registration until after the page has loaded, to ensure that our
//   // precaching requests don't degrade the first visit experience.
//   // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
//   window.addEventListener('load', function() {
//     // Your service-worker.js *must* be located at the top-level directory relative to your site.
//     // It won't be able to control pages unless it's located at the same level or higher than them.
//     // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
//     // See https://github.com/slightlyoff/ServiceWorker/issues/468
//     navigator.serviceWorker.register('service-worker.js').then(function(reg) {
//       // updatefound is fired if service-worker.js changes.
//       reg.onupdatefound = function() {
//         // The updatefound event implies that reg.installing is set; see
//         // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
//         var installingWorker = reg.installing;
//
//         installingWorker.onstatechange = function() {
//           switch (installingWorker.state) {
//             case 'installed':
//             if (navigator.serviceWorker.controller) {
//               // At this point, the old content will have been purged and the fresh content will
//               // have been added to the cache.
//               // It's the perfect time to display a "New content is available; please refresh."
//               // message in the page's interface.
//               console.log('New or updated content is available.');
//             } else {
//               // At this point, everything has been precached.
//               // It's the perfect time to display a "Content is cached for offline use." message.
//               console.log('Content is now available offline!');
//             }
//             break;
//
//             case 'redundant':
//             console.error('The installing service worker became redundant.');
//             break;
//           }
//         };
//       };
//     }).catch(function(e) {
//       console.error('Error during service worker registration:', e);
//     });
//   });
// }
