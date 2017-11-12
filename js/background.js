chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, { event: 'tab_updated' });
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get('extension_enabled', function(result) {
        if (result == undefined || result.extension_enabled == undefined || result.extension_enabled) {
            chrome.storage.local.set({'extension_enabled': false}, function() {
                // chrome.browserAction.setIcon({ path: 'images/disabled.png' });
                chrome.browserAction.setTitle({ title: chrome.runtime.getManifest().name + ' (disabled)'});
            });
        } else {
            chrome.storage.local.set({'extension_enabled': true}, function() {
                // chrome.browserAction.setIcon({ path: 'images/enabled.png'});
                chrome.browserAction.setTitle({ title: '' });
            });
        }
    });
});
