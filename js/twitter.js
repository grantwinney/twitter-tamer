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
rMap.set('footer', '[aria-label="Footer"]');

// Main Column Elements
let cMap = new Map();
cMap.set('new_tweet_notification', '.r-6czh2s');
cMap.set('tweet_box', '.DraftEditor-root');
cMap.set('reply', '[data-testid="reply"]');
cMap.set('retweet', '[data-testid="retweet"]');
cMap.set('like', '[data-testid="like"]');
cMap.set('share', '[aria-label="Share Tweet"]');
cMap.set('replies', '');
cMap.set('ads', '');

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
        element.style.setProperty('visibility', 'visible');
    });
    document.querySelectorAll(optMap.get('left_banner')).forEach(function (element) {
        element.style.setProperty('visibility', 'visible');
    });
}

function showAppropriateDomElements() {
    chrome.storage.local.get('extension_enabled', function(ee_result) {
        chrome.storage.sync.get('options', function(o_result) {

            // If the extension is "disabled" or nothing's selected to hide, show both columns and return
            if (((ee_result != undefined && ee_result.extension_enabled != undefined && !ee_result.extension_enabled)
                 || o_result == undefined || o_result.options == undefined || o_result.options.length == 0)) {
                showEverything();
                return;
            }

            let elementsToShow = Array.from(optMap.keys()).filter(id => !o_result.options.includes(id));
            let elementsToHide = Array.from(optMap.keys()).filter(id => o_result.options.includes(id));

            // Left Column Elements
            if (elementsToShow.includes('left_banner')) {
                let leftSelectorsToHide = elementsToHide.filter(id => Array.from(lMap.keys()).includes(id)).map(id => lMap.get(id)).join(',');

                if (leftSelectorsToHide.length > 0) {
                    watchForNewArrivalsOnce(leftSelectorsToHide, function(element) {
                        element.style.setProperty('display', 'none');
                    });
                }

                document.querySelectorAll(optMap.get('left_banner')).forEach(function (element) {
                    element.style.setProperty('visibility', 'visible');
                });
            }

            // Right Column Elements
            if (elementsToShow.includes('right_banner')) {
                let rightSelectorsToHide = elementsToHide.filter(id => Array.from(rMap.keys()).includes(id)).map(id => rMap.get(id)).join(',');

                if (rightSelectorsToHide.length > 0) {
                    watchForNewArrivals(rightSelectorsToHide, function(element) {
                        if (element['outerHTML'].includes('role="search"')) {
                            element = element.parentElement.parentElement.parentElement.parentElement;
                            element.nextElementSibling.style.setProperty('display', 'none');
                        } else if (element['outerHTML'].includes('aria-label="Who to follow"')) {
                            element = element.parentElement.parentElement;
                        } else if (element['outerHTML'].includes('aria-label="Footer"')) {
                            element = element.parentElement;
                        }
                        element.style.setProperty('display', 'none');
                        document.querySelectorAll(optMap.get('right_banner')).forEach(function (el) {
                            el.style.setProperty('visibility', 'visible');
                        });
                    });
                } else {
                    watchForNewArrivalsOnce(optMap.get('right_banner'), function (element) {
                        element.style.setProperty('visibility', 'visible');
                    });
                }
            }

            // Main Column Elements
            let centerSelectorsToHide = elementsToHide.filter(id => Array.from(cMap.keys()).includes(id)).map(id => cMap.get(id)).join(',');
            if (centerSelectorsToHide.length > 0) {
                watchForNewArrivals(centerSelectorsToHide, function(element) {
                    let oHTML = element['outerHTML'];
                    if (oHTML.includes('data-testid="reply"') || oHTML.includes('data-testid="like"')
                        || oHTML.includes('data-testid="retweet"') || oHTML.includes('aria-label="Share Tweet"')) {
                        element = element.parentElement;
                    } else if (element.className = 'DraftEditor-root') {
                        element = element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
                                         .parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
                                         .parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                    }
                    element.style.setProperty('display', 'none');
                });
            }

            

            let selectors = Array.from(optMap.keys())
                                 .filter(id => !o_result.options.includes(id))
                                 .map(id => optMap.get(id));




            if (selectors.length > 0) {
                // enableVisibilityProperty(selectors.join(','));
                // if (selectors.includes(optMap.get('hide_other_comments'))) {
                //     enableDisplayProperty('.replies-to');
                //     watchForNewArrivals('.replies-to', function(element) {
                //         element.style.setProperty('display', '');
                //     });
                //     watchForNewArrivals('.ProfileTweet-actionCount', function(element) {
                //         element.style.setProperty('visibility', '');
                //     });
                // }
                // let hideMedia = optMap.get('hide_media_content');
                // if (selectors.includes(hideMedia)) {
                //     enableDisplayProperty(hideMedia);
                //     watchForNewArrivals('.AdaptiveMedia-container', function(element) {
                //         element.style.setProperty('display', '');
                //     });
                // }
                // let topNews = optMap.get('hide_search_top_news');
                // if (selectors.includes(topNews)) {
                //     enableDisplayProperty(topNews);
                // }
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
    if (message.event == 'tab_updated') {
        showAppropriateDomElements();
    }
});
