// Left Column Elements
let lMap = new Map();
lMap.set('logo', '[aria-label="Twitter"]');
lMap.set('home_button', '[data-testid="AppTabBar_Home_Link"]');
lMap.set('explore_button', '[data-testid="AppTabBar_Explore_Link"]');
lMap.set('notifications_button', '[data-testid="AppTabBar_Notifications_Link"]');
lMap.set('messages_button', '[data-testid="AppTabBar_DirectMessage_Link"]');
lMap.set('bookmarks_button', '[aria-label="Bookmarks"]');
lMap.set('lists_button', '[aria-label="Lists"]');
lMap.set('profile_button', '[aria-label="Profile"]');
lMap.set('more_button', '[data-testid="AppTabBar_More_Menu"]');
lMap.set('tweet_button', '[aria-label="Tweet"]');

// Right Column Elements
let rMap = new Map();
rMap.set('search', 'form[role="search"]');
rMap.set('trends', '[aria-label="Timeline: Trending now"]');
rMap.set('who_to_follow', '[aria-label="Who to follow"]');
rMap.set('relevant_people', '[aria-label="Relevant people"]');
rMap.set('footer', '[aria-label="Footer"]');

// Main Column Elements
let cMap = new Map();
cMap.set('new_tweet_notification', '[role="status"]');
cMap.set('tweet_box', '[aria-label="Tweet"],[data-testid="reply"],.DraftEditor-root');
cMap.set('reply', '[data-testid="reply"]');
cMap.set('retweet', '[data-testid="retweet"],.r-5kkj8d:not([role="group"]) > div:first-child');
cMap.set('like', '[data-testid="like"],[data-testid="unlike"],.r-5kkj8d:not([role="group"]) > div:last-child');
cMap.set('share', '[aria-label="Share Tweet"]');
cMap.set('replies', '[aria-label="Timeline: Conversation"] > div > div > div:not(:first-child)');
cMap.set('media', '.r-9x6qib');
cMap.set('ads', '[data-testid="tweet"]');

// All Elements
let optMap = new Map([...lMap, ...rMap, ...cMap]);
optMap.set('left_banner', 'header[role="banner"]');
optMap.set('right_banner', '[data-testid="sidebarColumn"]');

function watchForNewArrivals(selector, action) {
    document.unbindArrive(selector);
    document.arrive(selector, function() {
        action(this);
    });
}

function watchForNewArrivalsOnce(selector, action) {
    document.unbindArrive(selector);
    document.arrive(selector, {onceOnly: true}, function() {
        action(this);
    });
}

function showEverything() {
    watchForNewArrivalsOnce(optMap.get('right_banner'), function(element) {
        element.style.setProperty('visibility', 'visible', 'important');
    });
    
    let leftBanner = document.querySelector(optMap.get('left_banner'));
    leftBanner.style.setProperty('visibility', 'visible', 'important');
}

function showAppropriateDomElements() {
    chrome.storage.local.get('extension_enabled', function(ee_result) {
        chrome.storage.sync.get('options', function(o_result) {

            // If the extension is "disabled" or nothing's selected to hide, show both columns and return
            if (((ee_result !== undefined && ee_result.extension_enabled !== undefined && !ee_result.extension_enabled)
                 || o_result === undefined || o_result.options === undefined || o_result.options.length === 0)) {
                showEverything();
                return;
            }

            let urlPath = new URL(location.href).pathname;
            let elementsToShow = Array.from(optMap.keys()).filter(id => !o_result.options.includes(id));
            let elementsToHide = Array.from(optMap.keys()).filter(id => o_result.options.includes(id));

            // Left Column Elements
            if (elementsToShow.includes('left_banner')) {
                let leftSelectorsToHide = elementsToHide.filter(id => Array.from(lMap.keys()).includes(id)).map(id => lMap.get(id)).join(',');

                if (leftSelectorsToHide.length > 0) {
                    watchForNewArrivalsOnce(leftSelectorsToHide, function(element) {
                        element.style.setProperty('display', 'none', 'important');
                        let leftBanner = document.querySelector(optMap.get('left_banner'));
                        leftBanner.style.setProperty('visibility', 'visible', 'important');
                    });
                } else {
                    watchForNewArrivalsOnce(optMap.get('left_banner'), function (element) {
                        element.style.setProperty('visibility', 'visible', 'important');
                    });
                }
            }

            // Right Column Elements
            if (elementsToShow.includes('right_banner')) {
                let rightSelectorsToHide = elementsToHide.filter(id => Array.from(rMap.keys()).includes(id)).map(id => rMap.get(id)).join(',');

                if (rightSelectorsToHide.length > 0) {
                    watchForNewArrivals(rightSelectorsToHide, function(element) {
                        let oHTML = element['outerHTML'];
                        if (oHTML.includes('role="search"')) {
                            goUp(4, element).style.setProperty('display', 'none', 'important');;
                            element.nextElementSibling.style.setProperty('display', 'none', 'important');
                        } else if (oHTML.includes('aria-label="Who to follow"')) {
                            goUp(2, element).style.setProperty('display', 'none', 'important');;
                        } else if (oHTML.includes('aria-label="Relevant people"')) {
                            goUp(1, element).style.setProperty('display', 'none', 'important');;
                        } else if (oHTML.includes('aria-label="Footer"')) {
                            goUp(1, element).style.setProperty('display', 'none', 'important');;
                        } else {
                            element.style.setProperty('display', 'none', 'important');;
                        }

                        let rightBanner = document.querySelector(optMap.get('right_banner'));
                        rightBanner.style.setProperty('visibility', 'visible', 'important');
                    });
                } else {
                    watchForNewArrivalsOnce(optMap.get('right_banner'), function (element) {
                        element.style.setProperty('visibility', 'visible', 'important');
                    });
                }
            }

            // Main Column Elements
            let centerSelectorsToHide = elementsToHide.filter(id => Array.from(cMap.keys()).includes(id)).map(id => cMap.get(id)).join(',');
            if (centerSelectorsToHide.length > 0) {
                watchForNewArrivals(centerSelectorsToHide, function(element) {
                    let oHTML = element['outerHTML'];
                    if (oHTML.includes('data-testid="tweet"')) {
                        if (elementsToHide.includes('ads') && oHTML.includes('Promoted')) {
                            goUp(5, element).style.setProperty('display', 'none', 'important');
                        } else if (elementsToHide.includes('replies') && urlPath.includes('/status/')) {
                            element.style.setProperty('display', 'none', 'important');
                        } else if (elementsToHide.includes('media') && element.classList.contains('r-9x6qib')) {
                            element.style.setProperty('display', 'none', 'important');
                        }
                    } else if (oHTML.includes('data-testid="reply"') || oHTML.includes('data-testid="like"') || oHTML.includes('data-testid="unlike"')
                               || oHTML.includes('data-testid="retweet"') || oHTML.includes('aria-label="Share Tweet"')) {
                        element.style.setProperty('display', 'none', 'important');
                    } else {
                        if (elementsToHide.includes('tweet_box') && element.className === 'DraftEditor-root') {
                            let e = goUp(18, element);
                            e.style.setProperty('display', 'none', 'important');
                            e.nextElementSibling.style.setProperty('display', 'none', 'important');
                        } else {
                            element.style.setProperty('display', 'none', 'important');
                        }
                    }
                });
            }
        });
    });
}

function goUp(levels, element) {
    if (levels > 0) {
        return goUp(levels-1, element.parentElement);
    }
    return element;
}

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
    if (message.event === 'tab_updated') {
        showAppropriateDomElements();
    }
});
