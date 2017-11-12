function setBrowserActionButton() {
    chrome.storage.local.get('extension_enabled', function(result) {
        if (result == undefined || result.extension_enabled == undefined || result.extension_enabled) {
            chrome.browserAction.setIcon({ path: 'images/dft-64.png' });
            chrome.browserAction.setTitle({ title: '' });
        } else {
            chrome.browserAction.setIcon({ path: 'images/dft-64-bw.png'});
            chrome.browserAction.setTitle({ title: chrome.runtime.getManifest().name + ' (disabled)'});
        }
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, { event: 'tab_updated' });
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get('extension_enabled', function(result) {
        var wasEnabled = (result == undefined || result.extension_enabled == undefined || result.extension_enabled);
        if (wasEnabled) {
            chrome.storage.local.set({'extension_enabled': false}, function() {
                chrome.browserAction.setIcon({ path: 'images/dft-64-bw.png' });
                chrome.browserAction.setTitle({ title: chrome.runtime.getManifest().name + ' (disabled)'});
            });
        } else {
            chrome.storage.local.set({'extension_enabled': true}, function() {
                chrome.browserAction.setIcon({ path: 'images/dft-64.png'});
                chrome.browserAction.setTitle({ title: '' });
            });
        }
        if (tab.url.match(/^http(s?):\/\/(www\.)?twitter.com/)) {
            if (window.confirm("Refresh the page after " + (wasEnabled ? "disabling" : "enabling") + " the extension?")) {
                chrome.tabs.reload(tab.id)
            }
        }
    });
});

setBrowserActionButton();
