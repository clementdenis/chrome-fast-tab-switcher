const Q = require('q');
const util = require('../util');
let storeData;
let windows;

// This module keeps a list of recently activated tabs, and persists
// it to and from local storage. We use this data to allow the
// user to quicly bounce back and forth between tabs.
module.exports = chrome => {
  let recentTabs = null;

  return {
    getFromLocalStorage: key => util.pcall(chrome.storage.local.get.bind(chrome.storage.local), key),

    getAllWindows: () => util.pcall(chrome.windows.getAll),

    getActiveTabs: () => util.pcall(chrome.tabs.query.bind(chrome.tabs), {active: true}),

    getRecentTabs: function() {
      if (!recentTabs) {
        storeData = this.getFromLocalStorage('lastTabs');
        windows = this.getAllWindows();
        recentTabs = Q.all([storeData, windows]).spread((data, windows) => {
          try {
            data = JSON.parse(data.lastTabs) || {};
          } catch (error) {
            data = {};
          }
          const ids = windows.map(win => win.id.toString());
          // Remove the histories for any windows
          // that have been closed since we last saved.
          for (let key in data) {
            if (ids.indexOf(key.toString()) === -1) {
              delete data[key];
            }
          }
          return data;
        });
      }

      return recentTabs;
    },

    addRecentTab: function(windowId, tabId, skipIfAlreadyRecent) {
      return this.getRecentTabs().then(tabs => {
        if (!tabs[windowId]) tabs[windowId] = [null];
        if (skipIfAlreadyRecent && tabs[windowId][1] === tabId) return;
        tabs[windowId].push(tabId);
        // We always want to display the next-to-most-recent tab to the user
        // (as the most recent tab is the one we're on now).
        while (tabs[windowId].length > 2) {
          tabs[windowId].shift();
        }
        recentTabs = Q.when(tabs);
      });
    },

    removeHistoryForWindow: function(windowId) {
      return this.getRecentTabs().then(tabs => {
        delete tabs[windowId];
        recentTabs = Q.when(tabs);
      });
    },

    saveRecentTabs: () => Q.when(recentTabs).then(tabs => {
      if (!tabs) return;
      chrome.storage.local.set({lastTabs: JSON.stringify(tabs)});
    })
  };
};
