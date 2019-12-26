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
lMap.set('left_banner', 'header[role="banner"]');

// Right Column Elements
let rMap = new Map();
rMap.set('search', 'form[role="search"]');
rMap.set('trends', '[aria-label="Timeline: Trending now"]');
rMap.set('who_to_follow', '[aria-label="Who to follow"]');
rMap.set('relevant_people', '[aria-label="Relevant people"]');
rMap.set('footer', '[aria-label="Footer"]');
rMap.set('right_banner', '[data-testid="sidebarColumn"]');

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
cMap.set('who_to_follow_main', '[data-testid="UserCell"]');

// All Elements
let optMap = new Map([...lMap, ...rMap, ...cMap]);

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

function tryHideElement(element) {
    if (element) {
        element.style.setProperty('display', 'none');
    }
}

function tryHideElements(elements) {
    elements.forEach(element => tryHideElement(element));
}

function showAppropriateDomElements() {
    chrome.storage.local.get('extension_enabled', function(ee_result) {
        chrome.storage.sync.get('options', function(o_result) {

            // If the extension is "disabled" or nothing's selected to hide, just return
            if (((ee_result !== undefined && ee_result.extension_enabled !== undefined && !ee_result.extension_enabled)
                 || o_result === undefined || o_result.options === undefined || o_result.options.length === 0)) {
                return;
            }

            // let urlPath = new URL(location.href).pathname;
            let elementsToHide = Array.from(optMap.keys()).filter(id => o_result.options.includes(id));

            // Left Column Elements
            if (elementsToHide.includes('left_banner')) {
                tryHideElement(document.querySelector(lMap.get('left_banner')));
                watchForNewArrivalsOnce(lMap.get('left_banner'), function(element) {
                    element.style.setProperty('display', 'none');
                });
            } else {
                let leftSelectorsToHide = elementsToHide.filter(id => Array.from(lMap.keys()).includes(id)).map(id => lMap.get(id)).join(',');
                if (leftSelectorsToHide.length > 0) {
                    tryHideElements(document.querySelectorAll(leftSelectorsToHide));
                    watchForNewArrivalsOnce(leftSelectorsToHide, function(element) {
                        element.style.setProperty('display', 'none');
                    });
                }
            }

            // Right Column Elements
            if (elementsToHide.includes('right_banner')) {
                tryHideElement(document.querySelector(rMap.get('right_banner')));
                watchForNewArrivals(rMap.get('right_banner'), function(element) {
                    element.style.setProperty('display', 'none');
                });
            } else {
                let rightSelectorsToHide = elementsToHide.filter(id => Array.from(rMap.keys()).includes(id)).map(id => rMap.get(id)).join(',');
                if (rightSelectorsToHide.length > 0) {
                    tryHideElements(document.querySelectorAll(rightSelectorsToHide));
                    watchForNewArrivals(rightSelectorsToHide, function(element) {
                        let oHTML = element['outerHTML'];
                        if (oHTML.includes('role="search"')) {
                            goUp(4, element).style.setProperty('display', 'none');
                            let sib = element.nextSibling;
                            if (sib) {
                                sib.style.setProperty('display', 'none');
                            }
                        } else if (oHTML.includes('aria-label="Who to follow"')) {
                            goUp(1, element).style.setProperty('display', 'none');
                        } else if (oHTML.includes('aria-label="Relevant people"')) {
                            goUp(1, element).style.setProperty('display', 'none');
                        } else if (oHTML.includes('aria-label="Footer"')) {
                            goUp(1, element).style.setProperty('display', 'none');
                        } else {
                            element.style.setProperty('display', 'none');
                        }
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
                            let p = goUp(5, element);
                            p.style.setProperty('display', 'none');
                            safeHideSiblings(p.parentElement, -1);
                            safeHideSiblings(p.parentElement, 1);
                        } else if (elementsToHide.includes('replies') && urlPath.includes('/status/')) {
                            element.style.setProperty('display', 'none');
                        } else if (elementsToHide.includes('media') && element.classList.contains('r-9x6qib')) {
                            element.style.setProperty('display', 'none');
                        }
                    } else if (oHTML.includes('data-testid="reply"') || oHTML.includes('data-testid="like"') || oHTML.includes('data-testid="unlike"')
                               || oHTML.includes('data-testid="retweet"') || oHTML.includes('aria-label="Share Tweet"')) {
                        element.style.setProperty('display', 'none');
                    } else if (oHTML.includes('data-testid="UserCell"')) {
                        element.style.setProperty('display', 'none');
                        let p = element.parentElement.parentElement;
                        safeHideSiblings(p, -3);
                        safeHideSiblings(p, 3);
                    } else {
                        if (elementsToHide.includes('tweet_box') && element.className === 'DraftEditor-root') {
                            let e = goUp(18, element);
                            e.style.setProperty('display', 'none');
                            e.nextSibling.style.setProperty('display', 'none');
                        } else {
                            element.style.setProperty('display', 'none');
                        }
                    }
                });
            }
        });
    });
}

// return the nth parent element
function goUp(levels, element) {
    if (levels > 0) {
        return goUp(levels-1, element.parentElement);
    }
    return element;
}

// hide n sibling elements before (negative number) or after (positive number) an element
// if one of the siblings is missing (null/undefined), returns without throwing an error
function safeHideSiblings(element, number_of_siblings) {
    if (!element || number_of_siblings === 0) {
        return;
    }
    if (number_of_siblings < 0) {
        let sibling = element.previousSibling;
        if (sibling) {
            sibling.style.setProperty('display', 'none');
            safeHideSiblings(sibling, number_of_siblings+1)
        }
    } else {
        let sibling = element.nextSibling;
        if (sibling) {
            sibling.style.setProperty('display', 'none');
            safeHideSiblings(sibling, number_of_siblings-1)
        }
    }
}

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
    if (message.event === 'tab_updated') {
        showAppropriateDomElements();
    }
});
