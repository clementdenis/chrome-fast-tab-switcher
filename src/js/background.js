const Q = require('q');
const tabHistory = require('./background/tab_history')(chrome);
const windowManager = require('./background/window_manager')(chrome);

const PADDING_TOP = 50;
const PADDING_BOTTOM = 50;
const SWITCHER_WIDTH = 600;

// Persist the tab history to local storage every minute.
setInterval(() => {
  tabHistory.saveRecentTabs();
}, 60 * 1000);

// Chrome will wake up the extension, if necessary, to call this listener.
chrome.tabs.onActivated.addListener(tab => {
  const windowId = tab.windowId;
  const tabId = tab.tabId;
  tabHistory.addRecentTab(windowId, tabId);
});

// When the user closes a window, remove all that window's history.
chrome.windows.onRemoved.addListener(windowId => {
  tabHistory.removeHistoryForWindow(windowId);
});

// Add the currently active tab for each window to the history
// if they're not already the most recent active tab.
tabHistory.getActiveTabs().then(tabs => {
  for (const tab of tabs) {
    const windowId = tab.windowId;
    const tabId = tab.id;
    tabHistory.addRecentTab(windowId, tabId, true);
  }
});

chrome.commands.onCommand.addListener(command => {
  // Users can bind a key to this command in their Chrome
  // keyboard shortcuts, at the bottom of their extensions page.
  if (command === 'show-tab-switcher') {
    const currentWindow = windowManager.getCurrentWindow();
    const switcherWindowId = windowManager.getSwitcherWindowId();

    Q.all([currentWindow, switcherWindowId])
    .spread((currentWindow, switcherWindowId) => {
      // Don't activate the switcher from an existing switcher window.
      if (currentWindow.id === switcherWindowId) return;

      // When the user activates the switcher and doesn't have "search
      // in all windows" enabled, we need to know which was the last
      // non-switcher window that was active.
      windowManager.setLastWindowId(currentWindow.id);
      const left = currentWindow.left +
          Math.round((currentWindow.width - SWITCHER_WIDTH) / 2);
      const top = currentWindow.top + PADDING_TOP;
      const height = Math.max(currentWindow.height - PADDING_TOP - PADDING_BOTTOM, 600);
      windowManager.showSwitcher(SWITCHER_WIDTH, height, left, top);
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, respond) => {
  if (request.switchToTabId) {
    windowManager.switchToTab(request.switchToTabId);
  }

  if (request.sendTabData) {
    Q.all([tabHistory.getRecentTabs(), windowManager.getLastWindowId()])
    .spread((recentTabs, lastWindowId) => windowManager.queryTabs(sender.tab.id, request.searchAllWindows,
        recentTabs, lastWindowId)).then(data => {
      respond(data);
    });
    // We must return `true` so that Chrome leaves the
    // messaging channel open, thus allowing us to call `respond`.
    return true;
  }

  if (request.closeTabId) {
    windowManager.closeTab(request.closeTabId);
  }
});
