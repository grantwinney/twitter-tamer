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
rMap.set('trends', '[aria-label="Timeline: Trending now"]');
rMap.set('who_to_follow', '[aria-label="Who to follow"]');
rMap.set('relevant_people', '[aria-label="Relevant people"]');
rMap.set('footer', '[aria-label="Footer"]');
rMap.set('right_banner', '[data-testid="sidebarColumn"]');
rMap.set('search', '[role="search"],[href="/search-advanced"]');

// Main Column Elements
let cMap = new Map();
// cMap.set('new_tweet_notification', '[role="status"]');  // STILL NEEDED?
cMap.set('tweet_box', '.DraftEditor-root');
cMap.set('timeline', '[aria-label="Timeline: Your Home Timeline"]');
cMap.set('reply', '[data-testid="reply"]');
cMap.set('retweet', '[data-testid="retweet"]');
cMap.set('like', '[data-testid="like"],[data-testid="unlike"]');
cMap.set('share', '[aria-label="Share Tweet"]');
cMap.set('replies', '[aria-label="Timeline: Conversation"]');
// cMap.set('media', 'article[role="article"] div.r-9x6qib a[role="link"]'); //[target="_blank"]
cMap.set('ads', '[data-testid="tweet"] span');
cMap.set('who_to_follow_main', '[data-testid="UserCell"]');
cMap.set('main', '[data-testid="primaryColumn"]');

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


// return the nth parent node
function navUpDomTree(levels, node) {
    if (levels > 0) {
        return navUpDomTree(levels-1, node.parentElement);
    } else {
        return node;
    }
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

function hasAttributeValue(element, attribute, attributeValue) {
    return element
        && element.hasAttribute(attribute)
        && element.getAttribute(attribute) == attributeValue;
}

function hasAttributeValues(element, attribute, attributeValues) {
    return element
        && element.hasAttribute(attribute)
        && attributeValues.some(av => element.getAttribute(attribute) == av);
}

function showAppropriateDomElements() {
    chrome.storage.local.get('extension_enabled', function(ee_result) {
        chrome.storage.sync.get('options', function(o_result) {

            // If the extension is "disabled" or nothing's selected to hide, just return
            if (((ee_result && !ee_result.extension_enabled)
                 || !o_result || !o_result.options || o_result.options.length === 0)) {
                return;
            }

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
                        if (hasAttributeValue(element, 'role', 'search')) {
                            // search fields
                            navUpDomTree(4, element).style.setProperty('display', 'none');
                            safeHideSiblings(element, 1);
                        } else if (hasAttributeValue(element, 'aria-label', 'Who to follow')
                                   || hasAttributeValue(element, 'aria-label', 'Relevant people')
                                   || hasAttributeValue(element, 'aria-label', 'Footer')) {
                            navUpDomTree(1, element).style.setProperty('display', 'none');
                        } else {
                            element.style.setProperty('display', 'none');
                        }
                    });
                }
            }

            // Primary Column Elements
            if (elementsToHide.includes('main')) {
                tryHideElement(document.querySelector(cMap.get('main')));
                watchForNewArrivals(cMap.get('main'), function(element) {
                    element.style.setProperty('display', 'none');
                });
            } else {
                let centerSelectorsToHide = elementsToHide.filter(id => Array.from(cMap.keys()).includes(id)).map(id => cMap.get(id)).join(',');
                if (centerSelectorsToHide.length > 0) {
                    watchForNewArrivals(centerSelectorsToHide, function(element) {
                        if (hasAttributeValue(element, 'href', '/search-advanced')) {
                            // search bar
                            navUpDomTree(4, element).setProperty('display', 'none');
                        } else if (element.classList.contains('DraftEditor-root')) {
                            // write tweet box
                            let el = navUpDomTree(18, element);
                            el.style.setProperty('display', 'none');
                            el.nextSibling.style.setProperty('display', 'none');
                        } else if (hasAttributeValue(element, 'aria-label', 'Timeline: Your Home Timeline')) {
                            // timeline
                            let el = navUpDomTree(4, element);
                            el.style.setProperty('display', 'none');
                            el.previousSibling.style.setProperty('display', 'none');
                        } else if (hasAttributeValue(element, 'aria-label', 'Reply')) {
                            // reply button
                            navUpDomTree(1, element).style.setProperty('display', 'none');
                        } else if (hasAttributeValues(element, 'data-testid', ['reply', 'like', 'unlike', 'retweet']) || hasAttributeValue(element, 'aria-label', 'Share Tweet')) {
                            // tweet actions
                            element.style.setProperty('display', 'none');
                        } else if (location.pathname.split('/')[2] === 'status' && hasAttributeValue(element, 'aria-label', 'Timeline: Conversation')) {
                            // replies to a tweet (conversation)
                            element.classList.add('replies');
                        // } else if (hasAttributeValue(element, 'role', 'link')) {
                        //     // media
                        //     let a = document.createElement('a');
                        //     a.href = element.href;
                        //     a.innerHTML = element.href;
                        //     element.parentNode.replaceChild(a, element);
                        //     navUpDomTree(2, element).classList.add('no-media-link-padding');
                        } else if (element.innerHTML === 'Promoted') {
                            // promotions
                            if ((location.pathname.split('/')[1] === 'home')) {
                                let el = navUpDomTree(2, element);
                                el.style.setProperty('display', 'none');
                                safeHideSiblings(el, -1);
                            } else {
                                let el = navUpDomTree(3, element);
                                el.style.setProperty('display', 'none');
                                safeHideSiblings(el, -1);
                                safeHideSiblings(el, 1);
                            }
                        } else if (hasAttributeValue(element, 'data-testid', 'UserCell')) {
                            // who to follow
                            element.style.setProperty('display', 'none');
                            let p = element.parentElement.parentElement;
                            safeHideSiblings(p, -3);
                            safeHideSiblings(p, 3);
                        }
                    });
                }
            }
        });
    });
}
showAppropriateDomElements();

// chrome.storage.local.get('extension_enabled', function(result) {
//     if (!result || result.extension_enabled) {
//         showAppropriateDomElements();
//         // chrome.browserAction.setIcon({ path: 'images/dft-64.png' });
//         // chrome.browserAction.setTitle({ title: '' });
//     } else {
//         // chrome.browserAction.setIcon({ path: 'images/dft-64-bw.png'});
//         // chrome.browserAction.setTitle({ title: chrome.runtime.getManifest().name + ' (disabled)'});
//     }
// });
