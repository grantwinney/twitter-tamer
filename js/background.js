chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.sendMessage(tabId, { event: 'tab_updating' });
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, { event: 'tab_updated' });
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // message.event == 'ping_reply'
    chrome.browserAction.enable(sender.tab.id);
});

chrome.browserAction.disable();
