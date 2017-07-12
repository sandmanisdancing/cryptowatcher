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
  fullData: [],
  loadStatus: null,
  investPopup: false,
  myInvestments: [],
  top10list: null,
  investTemplate: {
    "id": null,
    "cryptoInvestedAmount": null,
    "cryptoInvestedSymbol": "Crypto name",
    "usdInvested": null,
    "coinsAmount": null,
    "coinsSymbol": null,
    "finishDate": null,
    "usdWithdraw": null,
    "coinsWithdraw": null
  }
};

const app = new Vue({
  el: "#crypto-app",
  data() {
    return data;
  },

  filters: {
    dateToDays: function(value) {
      if(!value) return "";
      let computed = Math.ceil((Date.parse(value) - Date.now()) / (60*60*24*1000)),
          day = " day";

      if(+computed != 1 && +computed != -1 && +computed != 0) day = " days";

      if(+computed > 0) {
        return "finish in " + computed + day;
      } else if (+computed == 0) {
        return "finish today";
      } else {
        return "finished " + Math.abs(computed) + day + " ago";
      }
    }
  },

  methods: {
    fetchData: function() {
      const request = new XMLHttpRequest();
      var self = this;

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
            self.fullData = JSON.parse(request.responseText);
            self.createTop10list();

            self.loadStatus = null;
          } catch (e) {
            console.log("Wrong response " + e.message);
          }
        }
      }
    },

    createTop10list: function() {
      this.loadStatus = "Creating top 10 list...";

      const list = {};

      for(let i = 0; i < 10; i++) {
        list[this.fullData[i].name] = this.fullData[i].price_usd;
      }

      this.loadStatus = null;
      this.top10list = list;
    },

    createInvestment: function(e) {
      // this method is used both to create and to edit investment entry

      // if ID is empty we assign to it current timestamp
      // that is how I detect this is editing or creating of investment entry
      if(!this.investTemplate.id) this.investTemplate.id = Date.now();

      // converting symbol to uppercase, so it is possible to search through coinmarketcap API JSON
      if(this.investTemplate.coinsSymbol) this.investTemplate.coinsSymbol = this.investTemplate.coinsSymbol.toUpperCase();

      // if myInvestments are empty, just push new entry
      // and if not, start this checking
      if(this.myInvestments.length) {

        // this is for editing existing element,
        // there is need to check if is it already in myInvestments
        let elementExists = this.myInvestments.some((item) => {
          return item["id"] === this.investTemplate.id;
        });

        // and if it is - write new data into investment entry
        if(elementExists) {
          this.myInvestments.forEach((item, index) => {
            if(item["id"] === this.investTemplate.id) {
              Object.assign(item, this.investTemplate);
            }
          });
        } else {
          this.myInvestments.push(this.investTemplate)
        }
      } else {
        this.myInvestments.push(this.investTemplate);
      }

      // then push to localStorage
      this.saveToLS();
      // and read it from LS
      this.getMyInvestments();

      // clear form
      for (key in this.investTemplate) {
        this.investTemplate[key] = null;
      };

      e.target.reset();
    },

    countRate: function(amount, symbol) {
      let rate = 0;

      this.currenciesList.forEach((item) => {
        if(item["symbol"] === symbol) {
          rate = amount * item["price_usd"];
        }
      });

      return rate.toFixed(2);
    },

    getMyInvestments: function() {
      if(localStorage.getItem("myInvestments")) this.myInvestments = JSON.parse(localStorage.getItem("myInvestments"));
    },

    removeToken: function(index) {
      this.myInvestments.splice(index, 1);

      this.saveToLS();
    },

    editToken: function(index) {
      for(key in this.myInvestments[index]) {
        this.investTemplate[key] = this.myInvestments[index][key];
      }

      this.investPopup = true;
    },

    saveToLS: function() {
      localStorage.setItem("myInvestments", JSON.stringify(this.myInvestments));
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

  computed: {
    currenciesList: function() {
      this.loadStatus = "Get currencies list...";

      const list = this.fullData.map((item) => {
        let currency = {};
        currency["name"] = item["name"];
        currency["symbol"] = item["symbol"];
        currency["price_usd"] = item["price_usd"];

        return currency;
      });

      this.loadStatus = null;

      return list;
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
