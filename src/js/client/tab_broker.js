const Q = require('q');
const util = require('../util');

module.exports = chrome => {
  const responses = {};

  return {
    query: searchAllWindows => {
      const opts = {
        sendTabData: true,
        searchAllWindows: searchAllWindows
      };
      const fn = chrome.runtime.sendMessage.bind(chrome.runtime);

      return util.pcall(fn, opts).then(data => {
        const tabs = data.tabs;
        const lastActive = data.lastActive;

        const firstTab = [];
        const otherTabs = [];

        for(const tab of tabs) {
          if (tab.id === lastActive) firstTab.push(tab);
          else otherTabs.push(tab);
        }

        return firstTab.concat(otherTabs);
      });
    },

    switchTo: tab => {
      chrome.runtime.sendMessage({switchToTabId: tab.id});
    },

    close: tab => {
      chrome.runtime.sendMessage({closeTabId: tab.id});
    }
  };
};
