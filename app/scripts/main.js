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
  deleteIndex: null,
  myInvestments: [],
  bittrex: [],
  investTemplate: {
    id: null,
    cryptoInvestedAmount: 0,
    cryptoInvestedSymbol: "Crypto name",
    usdInvested: null,
    coinsAmount: 0,
    coinsSymbol: null,
    finishDate: null,
    url: null,
    usdWithdraw: 0,
    coinsWithdraw: 0,
    type: null
  },
  transaction: {
    usdWithdrawTemp: 0,
    coinsWithdrawTemp: 0,
    coinsBuyTemp: 0,
    usdSpentTemp: 0,
    cryptoSpentTemp: 0,
  },
  authentication: {
    user: {
      displayName: 'Not signed in.'
    },
    isSignedIn: false
  },
  activeElement: null,
  popup: {
    investPopup: false,
    deletePopup: false,
    signInPopup: false,
    transactionPopup: false,
    buy: false
  },
  notListed: true,
  searchMarket: ""
};

Vue.component('page-footer', {
  template: '<footer class="pagefooter">\
    <div class="pagefooter__copy">\
      <p>&copy; 2017 — you are able to use this app in the way you need.</p>\
      <p>Built with <a href="http://coinmarketcap.com/" target="_blank" rel="noopener">Coinmarketcap API</a> and <a href="http://vuejs.org/" target="_blank" rel="noopener">Vue.js</a>.</p>\
    </div>\
    <div class="pagefooter__donate">\
      <p>Donations are always appreciated.</p>\
      <p>ETH <strong>0x9e41B796ac20320b462F9aCf896717c04302672C</strong></p>\
      <p>BTC <strong>1NbwV5pqAJKaipM1pTQpdbisB3rwtKq6MF</strong></p>\
    </div>\
  </footer>',
  data () {
    return data;
  }
});

const app = new Vue({
  el: "#crypto-app",
  data () {
    return data;
  },

  filters: {
    dateToDays (value) {
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

    billions (value) {
      value = +value;
      return value.toLocaleString();
    },

    bigNumber (value) {
      return (value/1000000000).toFixed(3) + 'B';
    },

    roundToThreeDigits (value) {
      return Math.round((value) * 1000) / 1000;
    },

    tofix2 (value) {
      if(isNaN(value)) value = 0;

      let fixed = parseFloat(value).toFixed(2);

      return fixed;
    },

    tofixWhole (value) {
      if(!value) value = 0;

      let fixed = parseFloat(value).toFixed(2),
          fixedInt = fixed.split('.')[0];

      return fixedInt;
    },

    tofixFraction (value) {
      if(!value) value = 0;

      let fixed = parseFloat(value).toFixed(2),
          fixedInt = fixed.split('.')[1];

      return fixedInt;
    },

    tofixPrice (value) {
      if(!value) value = 0;

      let fixed = parseFloat (value);

      if (fixed > 1) {
        fixed = fixed.toFixed(2);
      } else if (fixed < 1 && fixed > 0) {
        fixed = fixed.toFixed(4);
      }

      return fixed;
    }
  },

  methods: {
    fetchData () {
      const request = new XMLHttpRequest();

      request.open('GET', 'https://api.coinmarketcap.com/v1/ticker/', true);
      request.send();

      request.onreadystatechange = () => {
        if (request.readyState !== 4) {
          this.loadStatus = "Loading...";

          return;
        }

        if (request.status != 200) {
          this.loadStatus = "Error!";
          console.log( request.status + ': ' + request.statusText );
        } else {
          try {
            this.fullData = JSON.parse(request.responseText);
            this.saveToLS('fullData');

            this.loadStatus = null;
          } catch (e) {
            console.log("Wrong response " + e.message);
          }
        }
      }
    },

    signIn (device, providerPassed) {
      let provider;

      if (providerPassed === "facebook") {
        provider = new firebase.auth.FacebookAuthProvider();
      } else if (providerPassed === "google") {
        provider = new firebase.auth.GoogleAuthProvider();
      } else if (providerPassed === "twitter") {
        provider = new firebase.auth.TwitterAuthProvider();
      }

      if (device === 'mobile') {
        firebase.auth().signInWithRedirect(provider).then((result) => {
          this.authentication.isSignedIn = true;
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
      } else {
        firebase.auth().signInWithPopup(provider).then((result) => {
          this.authentication.isSignedIn = true;
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

      this.closeWindow();

      // after login it's good to refresh market data
      this.fetchData();
    },

    signOut () {
      firebase.auth().signOut().then(() => {
        this.authentication.user = 'Not signed in.';
        this.authentication.isSignedIn = false;
      }).catch(function(error) {
        // An error happened.

        console.log('Sign out error: ', error);
      });

      this.myInvestments = [];
      this.saveToLS('myInvestments');
    },

    checkIsSignedIn () {
      this.loadStatus = 'Authentication...';

      let lsArray = [];

      for (let item in localStorage) {
        lsArray.push(item);
      }

      this.authentication.isSignedIn = lsArray.some(item => {
        if (item.indexOf('firebase:authUser') !== -1) return item;
      });

      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.authentication.user = user;
          // this.authentication.isSignedIn = true;

          this.readUserData();
        } else {
          // this.authentication.isSignedIn = false;
        }
      });
    },

    writeUserData () {
      firebase.database().ref('users/' + this.authentication.user.uid).set({
        'myInvestments': JSON.parse(localStorage.getItem('myInvestments'))
      });
    },

    readUserData () {
      this.loadStatus = 'Loading investment data...';

      const investmentsRecord = firebase.database().ref('users/' + this.authentication.user.uid);

      investmentsRecord.once('value').then((snapshot) => {
        this.myInvestments = snapshot.val().myInvestments;
        this.saveToLS('myInvestments');
      });

      this.loadStatus = null;
    },

    createInvestment (e) {
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
          return item.id === this.investTemplate.id;
        });

        // and if it is - write new data into investment entry
        if (elementExists) {
          this.myInvestments.forEach((item, index) => {
            if(item.id === this.investTemplate.id) {
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
      // close dialog
      this.closeWindow();
      // clear invest template
      this.clearInvestTemplate();
      // if signed in, write whole investment table to DB
      if (this.authentication.isSignedIn) this.writeUserData();
    },

    createTransaction () {
      this.myInvestments.forEach((item, index) => {
        if (item.id === this.investTemplate.id) {
          item.coinsWithdraw += this.transaction.coinsWithdrawTemp;
          item.usdWithdraw += this.transaction.usdWithdrawTemp;
        }
      });

      // then push to localStorage
      this.saveToLS("myInvestments");
      // and read it from LS
      this.readFromLS("myInvestments");
      // clear form
      this.clearInvestTemplate();
      // close dialog
      this.closeWindow();
      // if signed in, write whole investment table to DB
      if(this.authentication.isSignedIn) this.writeUserData();
    },

    createPurchase () {
      this.myInvestments.forEach((item, index) => {
        if(item.id === this.investTemplate.id) {
          item.cryptoInvestedAmount += this.transaction.cryptoSpentTemp;
          item.coinsAmount += this.transaction.coinsBuyTemp;
          item.usdInvested += this.transaction.usdSpentTemp;
        }
      });

      // then push to localStorage
      this.saveToLS("myInvestments");
      // and read it from LS
      this.readFromLS("myInvestments");
      // clear form
      this.clearInvestTemplate();
      // close dialog
      this.closeWindow();
      // if signed in, write whole investment table to DB
      if(this.authentication.isSignedIn) this.writeUserData();
    },

    clearInvestTemplate () {
      this.investTemplate.id = null,
      this.investTemplate.cryptoInvestedAmount = 0,
      this.investTemplate.cryptoInvestedSymbol = "Crypto name",
      this.investTemplate.usdInvested = null,
      this.investTemplate.coinsAmount = 0,
      this.investTemplate.coinsSymbol = null,
      this.investTemplate.finishDate = null,
      this.investTemplate.url = null,
      this.investTemplate.usdWithdraw = 0,
      this.investTemplate.coinsWithdraw = 0,
      this.investTemplate.type = null,
      this.transaction.usdWithdrawTemp = 0,
      this.transaction.coinsWithdrawTemp = 0,
      this.transaction.cryptoSpentTemp = 0,
      this.transaction.coinsBuyTemp = 0,
      this.transaction.usdSpentTemp = 0
    },

    countRate (amount, symbol) {
      if (amount) {
        if (this.fullData) {
          let price = this.fullData.filter(item => item.symbol === symbol);

          if (price.length) {
            return amount * price[0]["price_usd"];
          } else {
            return 0;
          }
        }
      } else {
        return 0;
      }
    },

    show24hChange (symbol) {
      let change = 0;

      if (this.fullData) {
        change = this.fullData.filter(item => item.symbol === symbol);

        if (change.length) {
          return change[0]["percent_change_24h"];
        } else {
          return 0;
        }
      }
    },

    countSum (a, b) {
      if(!a) a = 0;
      if(!b) b = 0;

      return a + b;
    },

    saveToLS (name) {
      localStorage.setItem(name, JSON.stringify(this[name]));
    },

    readFromLS (name) {
      if(localStorage.getItem(name)) {
        this[name] = JSON.parse(localStorage.getItem(name));
      }
    },

    askRemoveToken (index) {
      this.openWindow('deletePopup');

      this.deleteIndex = index;
    },

    removeToken (id) {
      this.myInvestments.forEach((item, index) => {
        if (item.id === id) this.myInvestments.splice(index, 1);
      });

      this.saveToLS("myInvestments");
      this.closeWindow();
      this.deleteIndex = null;
      // if signed in, write whole investment table to DB
      if(this.authentication.isSignedIn) this.writeUserData();
    },

    editToken (index, type) {
      if (type === 'ico') {
        for (key in this.investTemplate) {
          this.investTemplate[key] = this.computedInvestments[index][key];
        }
      } else if (type === 'hold') {
        for (key in this.investTemplate) {
          this.investTemplate[key] = this.computedHold[index][key];
        }
      }

      this.openWindow('investPopup');
    },

    startTransaction (index, type) {
      if (type === 'ico') {
        for (key in this.investTemplate) {
          this.investTemplate[key] = this.computedInvestments[index][key];
        }
      } else if (type === 'hold') {
        for (key in this.computedHold[index]) {
          this.investTemplate[key] = this.computedHold[index][key];
        }
      }

      this.openWindow('transactionPopup');
    },

    startBuy (index, type) {
      for (key in this.investTemplate) {
        this.investTemplate[key] = this.computedHold[index][key];
      }

      this.openWindow('buy');
    },

    closeWindow () {
      for (key in this.popup) {
        this.popup[key] = false;
      }

      const dialog = document.querySelector('.popup-overlay');

      [...document.getElementById('crypto-app').children].forEach(item => {
        if (item !== dialog) {
          item.inert = false;
        }
      });

      this.clearInvestTemplate();

      this.activeElement.focus();
    },

    openWindow (popup) {
      this.activeElement = document.activeElement;
      this.popup[popup] = true;

      setTimeout(function () {
        const dialog = document.querySelector('.popup-overlay');

        [...document.getElementById('crypto-app').children].forEach(item => {
          if (item !== dialog) {
            item.inert = true;
          }
        });

        dialog.focus();
      }, 300);
    },

    showMarketsLink (symbol) {
      let name = this.fullData.filter(item => item.symbol === symbol);

      if(name.length) return 'https://coinmarketcap.com/assets/' + name[0].id + '/#markets';
    },

    showCryptoLink (id) {
      return 'https://coinmarketcap.com/assets/' + id;
    },

    showCoinImage (symbol, isInvestment) {
      if (this.pixelRatio > 1) {
        size = 32;
      } else {
        size = 16;
      }

      if(isInvestment === undefined) {
        let name = this.fullData.filter((item) => {
          if (item.symbol == symbol) return item;
        });

        if(name.length) return 'https://files.coinmarketcap.com/static/img/coins/' + size + 'x' + size + '/' + name[0].id + '.png';
      } else {
        return 'https://files.coinmarketcap.com/static/img/coins/' + size + 'x' + size + '/' + symbol + '.png';
      }
    },

    highlightRow (index, type) {
      index++;
      let selector;

      if (type === 'icos') {
        selector = '.table--myinv';
      } else if (type === 'hold') {
        selector = '.table--myHold';
      }

      let rows = document.querySelectorAll(selector + ' tbody tr:nth-child(' + index + ')');

      [...rows].forEach(item => item.classList.toggle('table__row-active'));
    },

    toggleListed () {
      this.notListed = !this.notListed;

      this.saveToLS('notListed');
    },

    setTableListing () {
      this.readFromLS("notListed");
    },

    detectPixelRatio () {
      const pixelRatio = window.devicePixelRatio || 1;

      this.pixelRatio = pixelRatio;
    }
  },

  computed: {
    coinsSold () {
      return +this.investTemplate.coinsWithdraw + +this.transaction.coinsWithdrawTemp;
    },

    usdGot () {
      return +this.investTemplate.usdWithdraw + +this.transaction.usdWithdrawTemp;
    },

    coinsBought () {
      return +this.investTemplate.coinsAmount - +this.investTemplate.coinsWithdraw + +this.transaction.coinsBuyTemp;
    },

    usdSpent () {
      return +this.investTemplate.usdInvested + +this.transaction.usdSpentTemp;
    },

    cryptoSpent () {
      return +this.investTemplate.cryptoInvestedAmount + +this.transaction.cryptoSpentTemp;
    },

    currencyListSearch () {
      if (this.fullData) {
        return this.fullData.filter((node) => {
          return node.name.toLowerCase().indexOf(this.searchMarket.toLowerCase()) === 0 ||
                 node.symbol.toLowerCase().indexOf(this.searchMarket.toLowerCase()) === 0;
        });
      }
    },

    isIcoExist () {
      return this.myInvestments.some((item) => {
        return item.type === 'type-ico';
      });
    },

    isHoldExist () {
      return this.myInvestments.some((item) => {
        return item.type === 'type-hold';
      });
    },

    totalPortfolioValue () {
      let portfolio = this.myInvestments,
          result;

      if (portfolio.length) {
        result = portfolio.reduce((sum, current) => {
          return sum + this.countRate(current.coinsAmount - current.coinsWithdraw, current.coinsSymbol);
        }, 0);

        return result;
      }
    },

    computedData () {
      let portfolio = JSON.parse(localStorage.getItem('myInvestments')),
      o = this.myInvestments;

      portfolio.forEach((item) => {
        item.icon = this.showCoinImage(item.coinsSymbol);
        item.currentValue = this.countRate(item.cryptoInvestedAmount, item.cryptoInvestedSymbol);
        item.quantity = item.coinsAmount - item.coinsWithdraw;
        item.marketsLink = this.showMarketsLink(item.coinsSymbol);
        item.price = this.countRate(1, item.coinsSymbol);
        item.buyPrice = item.usdInvested/item.coinsAmount;
        item["24hChange"] = this.show24hChange(item.coinsSymbol);

        if (item["24hChange"] >= 0) {
          item.isChangeNegative = true;
        } else {
          item.isChangeNegative = false;
        }

        let pl = (item.price - item.buyPrice) * item.quantity;

        if (pl < 0) {
          item.isProfit = true;
        } else {
          item.isProfit = false;
        }

        item.currentPl = Math.abs(pl);
        item.total = this.countRate(item.quantity, item.coinsSymbol)
        item.soldTotal = item.usdWithdraw + item.total;
        item.soldPl = Math.abs(((item.usdWithdraw / item.coinsWithdraw) - item.buyPrice) * item.coinsWithdraw);
        item.averagePrice = item.usdInvested / item.coinsAmount;
        item.currentCryptoAmount = item.total / this.countRate(1, item.cryptoInvestedSymbol);
        item.currentBtcAmount = item.total / this.countRate(1, 'BTC');
      });

      return portfolio;
    },

    computedInvestments () {
      const portfolio = this.computedData.filter(item => item.type === 'type-ico');

      // filtering not listed entries
      if (!this.notListed) {
        return portfolio.filter((investment) => {
          if (this.countRate(1, investment.coinsSymbol) !== 0) {
            return investment;
          }
        });
      }

      return portfolio;
    },

    computedHold () {
      const portfolio = this.computedData.filter(item => item['type'] === 'type-hold');

      return portfolio;
    }
  },

  created () {
    this.checkIsSignedIn();
    this.detectPixelRatio();
    this.setTableListing();
    this.fetchData();

    console.log('App created...');
  },

  mounted () {
    this.readFromLS("myInvestments");
    this.readFromLS("fullData");

    console.log('App mounted...');
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
