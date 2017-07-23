if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (target, firstSource) {
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

// Initialize Firebase
const config = {
  apiKey: "AIzaSyB4IbUCWaMDlIbhxlwckAY-_kQ59a-NyCg",
  authDomain: "cryptowatcher-86395.firebaseapp.com",
  databaseURL: "https://cryptowatcher-86395.firebaseio.com",
  projectId: "cryptowatcher-86395",
  storageBucket: "cryptowatcher-86395.appspot.com",
  messagingSenderId: "48789523257"
};
firebase.initializeApp(config);

const database = firebase.database();

const data = {
  fullData: [],
  loadStatus: null,
  loadFlag: false,
  investPopup: false,
  deletePopup: false,
  deleteIndex: null,
  myInvestments: [],
  top10list: null,
  currencyList: null,
  investTemplate: {
    "id": null,
    "cryptoInvestedAmount": 0,
    "cryptoInvestedSymbol": "Crypto name",
    "usdInvested": null,
    "coinsAmount": 0,
    "coinsSymbol": null,
    "finishDate": null,
    "url": null,
    "usdWithdraw": 0,
    "coinsWithdraw": 0
  },
  authentication: {
    user: null,
    isSignedIn: false
  }
};

const app = new Vue({
  el: "#crypto-app",
  data() {
    return data;
  },

  filters: {
    dateToDays: function (value) {
      if(!value) return "";
      let computed = Math.ceil((Date.parse(value) - Date.now()) / (60*60*24*1000)),
        day = ' day';

      if(+computed !== 1 && +computed !== -1 && +computed !== 0) day = " days";

      if(+computed > 0) {
        return "finish in " + computed + day;
      } else if (+computed === 0) {
        return 'finish today';
      } else {
        return 'finished ' + Math.abs(computed) + day + ' ago';
      }
    },

    bigNumber: function (value) {
      var parts = value.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    },

    roundToThreeDigits: function (value) {
      return Math.round((value) * 1000) / 1000;
    }
  },

  methods: {
    fetchData: function () {
      const request = new XMLHttpRequest();
      var self = this;

      request.open('GET', 'https://api.coinmarketcap.com/v1/ticker/', true);
      request.send();

      request.onreadystatechange = function () {
        if (request.readyState !== 4) {
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
            self.createCurrencyList();

            self.loadStatus = null;
          } catch (e) {
            console.log("Wrong response " + e.message);
          }
        }
      }
    },

    signIn: function (device) {
      var provider = new firebase.auth.GoogleAuthProvider();
      var self = this;

      // console.log(device)

      if(device === 'mobile') {
        firebase.auth().signInWithRedirect(provider).then(function (result) {
          // The signed-in user info.
          var user = result.user;

          self.authentication.isSignedIn = true;
        }).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code,
          errorMessage = error.message,
          // The email of the user's account used.
          email = error.email,
          // The firebase.auth.AuthCredential type that was used.
          credential = error.credential;

          console.log('errorCode: ' + errorCode + '\n'
          + 'errorMessage: ' + errorMessage + '\n'
          + 'email: ' + email + '\n'
          + 'credential: ' + credential);
        });
      } else {
        firebase.auth().signInWithPopup(provider).then(function (result) {
          var user = result.user;

          self.authentication.isSignedIn = true;
        }).catch(function (error) {
          var errorCode = error.code,
          errorMessage = error.message,
          email = error.email,
          credential = error.credential;

          console.log('errorCode: ' + errorCode + '\n'
          + 'errorMessage: ' + errorMessage + '\n'
          + 'email: ' + email + '\n'
          + 'credential: ' + credential);
        });
      }
    },

    signOut: function () {
      var self = this;

      firebase.auth().signOut().then(function() {
        self.authentication.user = null;
        self.authentication.isSignedIn = false;
      }).catch(function(error) {
        // An error happened.

        console.log('Sign out error: ', error);
      });

      this.myInvestments = [];
      this.saveToLS('myInvestments');
    },

    checkIsSignedIn: function () {
      var self = this;
      self.loadStatus = 'Authentication...';

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          self.authentication.user = user;
          self.authentication.isSignedIn = true;

          self.readUserData();
        } else {
          self.authentication.isSignedIn = false;
        }
      });
    },

    writeUserData: function () {
      firebase.database().ref('users/' + this.authentication.user.uid).set({
        'myInvestments': JSON.parse(localStorage.getItem('myInvestments'))
      });
    },

    readUserData: function () {
      this.loadStatus = 'Loading investment data...';

      var investmentsRecord = firebase.database().ref('users/' + this.authentication.user.uid);
      var self = this;

      investmentsRecord.once('value').then(function(snapshot) {
        self.myInvestments = snapshot.val().myInvestments;

        self.saveToLS('myInvestments');
      });

      this.loadStatus = null;
    },

    createTop10list: function () {
      this.loadStatus = "Creating top 10 list...";

      const list = {};

      for(let i = 0; i < 10; i++) {
        list[this.fullData[i].name] = this.fullData[i].price_usd;
      }

      this.loadStatus = null;
      this.top10list = list;
    },

    createCurrencyList: function () {
      this.loadStatus = "Get currencies list...";

      const list = this.fullData.map((item) => {
        let currency = {};
        currency["name"] = item["name"];
        currency["symbol"] = item["symbol"];
        currency["price_usd"] = +item["price_usd"];
        currency["percent_change_24h"] = +item["percent_change_24h"];
        currency["market_cap_usd"] = +item["market_cap_usd"];

        return currency;
      });

      this.loadStatus = null;
      this.currencyList = list;

      this.saveToLS("currencyList");
    },

    createInvestment: function (e) {
      // this method is used both to create and to edit investment entry

      // if ID is empty - assign to it current timestamp
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
      this.saveToLS("myInvestments");
      // and read it from LS
      this.readFromLS("myInvestments");
      // clear form
      this.clearInvestTemplate();
      // close dialog
      this.investPopup = false;
      // if signed in, write whole investment table to DB
      if(this.authentication.isSignedIn) this.writeUserData();
    },

    clearInvestTemplate: function (e) {
      this.investTemplate["id"] = null,
      this.investTemplate["cryptoInvestedAmount"] = 0,
      this.investTemplate["cryptoInvestedSymbol"] = "Crypto name",
      this.investTemplate["usdInvested"] = null,
      this.investTemplate["coinsAmount"] = 0,
      this.investTemplate["coinsSymbol"] = null,
      this.investTemplate["finishDate"] = null,
      this.investTemplate["url"] = null,
      this.investTemplate["usdWithdraw"] = 0,
      this.investTemplate["coinsWithdraw"] = 0
    },

    countRate: function (amount, symbol) {
      let rate = 0;

      if(!amount) amount = 0;

      if(this.currencyList) {
        this.currencyList.forEach((item) => {
          if(item["symbol"] === symbol) {
            rate = amount * item["price_usd"];
          }
        });

        return rate.toFixed(2);
      }
    },

    show24hChange: function (symbol) {
      let change = 'not listed';

      if(this.currencyList) {
        this.currencyList.forEach((item) => {
          if(item["symbol"] === symbol) {
            change = item["percent_change_24h"];
          }
        });

        return change;
      }
    },

    countSum: function (a, b) {
      if(!a) a = 0;
      if(!b) b = 0;

      let sum = parseFloat(a) + parseFloat(b);

      return sum.toFixed(2);
    },

    saveToLS: function (name) {
      localStorage.setItem(name, JSON.stringify(this[name]));
    },

    readFromLS: function (name) {
      if(localStorage.getItem(name)) {
        this[name] = JSON.parse(localStorage.getItem(name));
      }
    },

    askRemoveToken: function (index) {
      this.deletePopup = true;

      this.deleteIndex = index;
    },

    removeToken: function (index) {
      this.myInvestments.splice(index, 1);
      this.saveToLS("myInvestments");
      this.deletePopup = false;
      this.deleteIndex = null;
      // if signed in, write whole investment table to DB
      if(this.authentication.isSignedIn) this.writeUserData();
    },

    editToken: function (index) {
      for(key in this.myInvestments[index]) {
        this.investTemplate[key] = this.myInvestments[index][key];
      }

      this.investPopup = true;
    },

    closeWindow: function (popup, e) {
      if(e.target.matches('.popup-overlay') || e.target.matches('.popup__close')) {
        this[popup] = false;

        this.clearInvestTemplate();
      }
    },

    openWindow: function (e) {
      this.investPopup = true;

      setTimeout(function () {
        if(e.target.matches('button, button *')) document.querySelector('.popup-overlay').focus();
      }, 200);
    }
  },

  computed: {
    totalPortfolioValue: function () {
      let portfolio = this.myInvestments,
          result,
          self = this;

      if(portfolio.length) {
        if(portfolio.length > 1) {
          result = portfolio.reduce(function (a, b) {
            if(isNaN(a.coinsAmount)) {
              return a + self.countRate(+b.coinsAmount - +b.coinsWithdraw, b.coinsSymbol);
            } else {
              return self.countRate(+a.coinsAmount - +a.coinsWithdraw, a.coinsSymbol) + self.countRate(+b.coinsAmount - +b.coinsWithdraw, b.coinsSymbol)
            }
          });
        } else {
          result = portfolio.reduce(function (a, b) {
            return +self.countRate(a.coinsAmount - a.coinsWithdraw, a.coinsSymbol) +
            +self.countRate(b.coinsAmount - b.coinsWithdraw, b.coinsSymbol)
          }, 0);
        }

        return Math.round(result * 100) / 100;
      }
    }
  },

  created: function () {
    this.checkIsSignedIn();

    this.readFromLS("myInvestments");
    this.readFromLS("currencyList");
    this.fetchData();

    console.log('App created...');
  },
});

// if ('serviceWorker' in navigator) {
//   // Delay registration until after the page has loaded, to ensure that our
//   // precaching requests don't degrade the first visit experience.
//   // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
//   window.addEventListener('load', function () {
//     // Your service-worker.js *must* be located at the top-level directory relative to your site.
//     // It won't be able to control pages unless it's located at the same level or higher than them.
//     // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
//     // See https://github.com/slightlyoff/ServiceWorker/issues/468
//     navigator.serviceWorker.register('service-worker.js').then(function (reg) {
//       // updatefound is fired if service-worker.js changes.
//       reg.onupdatefound = function () {
//         // The updatefound event implies that reg.installing is set; see
//         // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
//         var installingWorker = reg.installing;
//
//         installingWorker.onstatechange = function () {
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
//     }).catch(function (e) {
//       console.error('Error during service worker registration:', e);
//     });
//   });
// }
