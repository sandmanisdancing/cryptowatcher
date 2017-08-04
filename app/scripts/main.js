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
  investPopup: false,
  deletePopup: false,
  deleteIndex: null,
  transactionPopup: false,
  signInPopup: false,
  myInvestments: [],
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
    "coinsWithdraw": 0,
    "usdWithdrawTemp": 0,
    "coinsWithdrawTemp": 0
  },
  authentication: {
    user: null,
    isSignedIn: false
  },
  tableFiltering: {
    notListed: true
  },
  searchInv: "",
  searchMarket: ""
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
      return (value/1000000000).toFixed(3) + 'B';
    },

    roundToThreeDigits: function (value) {
      return Math.round((value) * 1000) / 1000;
    },

    tofix2: function (value) {
      if(isNaN(value)) value = 0;

      let fixed = parseFloat(value).toFixed(2),
          fixedInt = fixed.slice(0,2),
          fixedFloat = fixed.slice(2,4);

      return fixed;
    },

    tofixWhole: function (value) {
      if(!value) value = 0;

      let fixed = parseFloat(value).toFixed(2),
          fixedInt = fixed.split('.')[0];

      return fixedInt;
    },

    tofixFraction: function (value) {
      if(!value) value = 0;

      let fixed = parseFloat(value).toFixed(2),
          fixedInt = fixed.split('.')[1];

      return fixedInt;
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
            self.saveToLS('fullData')

            self.loadStatus = null;
          } catch (e) {
            console.log("Wrong response " + e.message);
          }
        }
      }
    },

    signInFacebook: function () {
      var provider = new firebase.auth.FacebookAuthProvider();
    },

    signIn: function (device, providerPassed) {
      let provider;

      if (providerPassed === "facebook") {
        provider = new firebase.auth.FacebookAuthProvider();
      } else if (providerPassed === "google") {
        provider = new firebase.auth.GoogleAuthProvider();
      } else if (providerPassed === "twitter") {
        provider = new firebase.auth.TwitterAuthProvider();
      }

      var self = this;

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

      this.signInPopup = false;
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

    createTransaction: function () {
      this.myInvestments.forEach((item, index) => {
        if(item["id"] === this.investTemplate.id) {
          item["coinsWithdraw"] += this.investTemplate["coinsWithdrawTemp"];
          item["usdWithdraw"] += this.investTemplate["usdWithdrawTemp"];
        }
      });

      // then push to localStorage
      this.saveToLS("myInvestments");
      // and read it from LS
      this.readFromLS("myInvestments");
      // clear form
      this.clearInvestTemplate();
      // close dialog
      this.transactionPopup = false;
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
      this.investTemplate["coinsWithdraw"] = 0,
      this.investTemplate["usdWithdrawTemp"] = 0,
      this.investTemplate["coinsWithdrawTemp"] = 0
    },

    countRate: function (amount, symbol) {
      let rate = 0;

      if(!amount) amount = 0;

      if(this.fullData) {
        this.fullData.forEach((item) => {
          if(item["symbol"] === symbol) {
            rate = amount * item["price_usd"];
          }
        });

        return rate;
      }
    },

    show24hChange: function (symbol) {
      let change = 0;

      if(this.fullData) {
        this.fullData.forEach((item) => {
          if(item["symbol"] === symbol) {
            if(item["percent_change_24h"]) change = item["percent_change_24h"];
          }
        });

        return change;
      }
    },

    countSum: function (a, b) {
      if(!a) a = 0;
      if(!b) b = 0;

      let sum = parseFloat(a) + parseFloat(b);

      return sum;
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
      this.openWindow('deletePopup');

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

      this.openWindow('investPopup');
    },

    makeTransaction: function (index) {
      for(key in this.myInvestments[index]) {
        this.investTemplate[key] = this.myInvestments[index][key];
      }

      this.openWindow('transactionPopup');
    },

    closeWindow: function (popup, e) {
      if(e.target.matches('.popup-overlay') || e.target.matches('.popup__close')) {
        this[popup] = false;

        this.clearInvestTemplate();
      }
    },

    openWindow: function (popup) {
      this[popup] = true;

      setTimeout(function () {
        document.querySelector('.popup-overlay').focus();
      }, 200);
    },

    showMarketsLink: function (symbol) {
      let name = this.fullData.filter((item) => {
        if (item["symbol"] == symbol) return item;
      });

      if(name.length) return 'https://coinmarketcap.com/assets/' + name[0].name.toLowerCase() + '/#markets';
    },

    detectPixelRatio: function () {
      const pixelRatio = window.devicePixelRatio || 1;

      this.pixelRatio = pixelRatio;
    },

    showCoinImage: function (symbol, isInvestment) {
      if (this.pixelRatio > 1) {
        size = 32;
      } else {
        size = 16;
      }

      if(isInvestment === undefined) {
        let name = this.fullData.filter((item) => {
          if (item["symbol"] == symbol) return item;
        });

        if(name.length) return 'https://files.coinmarketcap.com/static/img/coins/' + size + 'x' + size + '/' + name[0].name.toLowerCase() + '.png';
      } else {
        return 'https://files.coinmarketcap.com/static/img/coins/' + size + 'x' + size + '/' + symbol + '.png';
      }
    },

    highlightRow: function (index) {
      index++;

      let rows = document.querySelectorAll('.table--myinv tbody tr:nth-child(' + index + ')');

      [...rows].forEach((item) => {
        item.classList.toggle('table__row-active');
      });
    }
  },

  computed: {
    coinsSold () {
      return +this.investTemplate.coinsWithdraw + +this.investTemplate.coinsWithdrawTemp;
    },

    usdGot () {
      return +this.investTemplate.usdWithdraw + +this.investTemplate.usdWithdrawTemp;
    },

    filteredInvestments () {
      var self = this;

      if (this.tableFiltering.notListed) {
        return this.myInvestments.filter(function (investment) {
          return investment.coinsSymbol.toLowerCase().indexOf(self.searchInv.toLowerCase())>=0;
        });
      } else {
        return this.myInvestments.filter(function (investment) {
          if (self.countRate(1, investment.coinsSymbol) !== 0) {
            return investment.coinsSymbol.toLowerCase().indexOf(self.searchInv.toLowerCase())>=0;
          }
        });
      }
    },

    currencyListSearch () {
      var self = this;

      if(this.fullData) {
        return this.fullData.filter(function (node) {
          return node.name.toLowerCase().indexOf(self.searchMarket.toLowerCase())>=0;
        });
      }
    },

    totalPortfolioValue () {
      let portfolio = this.myInvestments,
          result,
          self = this;

      if(portfolio.length) {
        if(portfolio.length > 1) {
          result = portfolio.reduce(function (a, b) {
            if(isNaN(a.coinsAmount)) {
              return a + +self.countRate(+b.coinsAmount - +b.coinsWithdraw, b.coinsSymbol);
            } else {
              return +self.countRate(+a.coinsAmount - +a.coinsWithdraw, a.coinsSymbol)
              + +self.countRate(+b.coinsAmount - +b.coinsWithdraw, b.coinsSymbol)
            }
          });
        } else {
          result = portfolio.reduce(function (a, b) {
            return +self.countRate(+a.coinsAmount - +a.coinsWithdraw, a.coinsSymbol) +
            +self.countRate(+b.coinsAmount - +b.coinsWithdraw, b.coinsSymbol)
          }, 0);
        }

        return result;
      }
    }
  },

  created: function () {
    this.checkIsSignedIn();
    this.detectPixelRatio();
    this.readFromLS("myInvestments");
    this.readFromLS("fullData");
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
