const Q = require("q");
const util = require("../util");

module.exports = chrome => {
    let switcherWindowId = Q.when(null);
    let lastWindowId = Q.when(null);

    return {
        getTabInfo: tabId => util.pcall(chrome.tabs.get, tabId),

        getCurrentWindow: () => util.pcall(chrome.windows.getCurrent),

        getSwitcherWindowId: () => switcherWindowId,

        setSwitcherWindowId: id => {
            switcherWindowId = Q.when(id);
            return switcherWindowId;
        },

        getLastWindowId: () => lastWindowId,

        setLastWindowId: id => {
            lastWindowId = Q.when(id);
            return lastWindowId;
        },

        showSwitcher: function(width, height, left, top) {
            const opts = {
                width: width,
                height: height,
                left: left,
                top: top,
                url: chrome.runtime.getURL("html/switcher.html"),
                focused: true,
                type: "popup"
            };

            return util
                .pcall(chrome.windows.create.bind(chrome.windows), opts)
                .then(function(switcherWindow) {
                        this.setSwitcherWindowId(switcherWindow.id);
                    }.bind(this));
        },

        queryTabs: (
            senderTabId,
            searchAllWindows,
            recentTabs,
            lastWindowId
        ) => {
            const options = searchAllWindows ? {} : {windowId: lastWindowId};
            /*util.pcall(chrome.tabGroups.query, options).then(tabGroups => {
                console.log(tabGroups);
                tabGroups.forEach(tabGroup => {
                    tabGroup.title
                })
            });*/
            return util.pcall(chrome.tabs.query, options).then(tabs => {
                tabs = tabs.filter(tab => tab.id !== senderTabId);
                return {
                    tabs: tabs,
                    lastActive: (recentTabs[lastWindowId] || [])[0] || null
                };
            });
        },

        switchToTab: function(tabId) {
            chrome.tabs.update(tabId, { active: true });
            return this.getTabInfo(tabId).then(tab => {
                if (tab) chrome.windows.update(tab.windowId, { focused: true });
            });
        },

        closeTab: tabId => util.pcall(chrome.tabs.remove, tabId)
    };
};
