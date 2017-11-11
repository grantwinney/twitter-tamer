function getNavigationBarOptionsMap() {
    var optionsMap = new Map();
    optionsMap.set('hide_moments', '.moments');
    optionsMap.set('hide_notifications', '.notifications');
    optionsMap.set('hide_messages', '.dm-nav');
    return optionsMap;
}

function getSideBarOptionsMap() {
    var optionsMap = new Map();
    optionsMap.set('hide_trend_button', '.Trends');
    optionsMap.set('hide_who_to_follow', '.wtf-module');
    optionsMap.set('hide_live_video', '.LiveVideoHomePageModuleContainer');
    optionsMap.set('hide_footer', '.Footer');
    return optionsMap;
}

function getCommentOptionsMap() {
    var optionsMap = new Map();
    optionsMap.set('hide_other_comments', '.replies-to, .ProfileTweet-actionCount');
    optionsMap.set('hide_media_content', '.AdaptiveMediaOuterContainer');
    return optionsMap;
}

function getMainTimelineOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap(), ...getCommentOptionsMap()]);
    optionsMap.set('hide_your_profile_summary', '.DashboardProfileCard');
    return optionsMap;
}

function getOthersTimelineOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap(), ...getCommentOptionsMap()]);
    optionsMap.set('hide_others_profile_card', '.ProfileHeaderCard');
    optionsMap.set('hide_others_profile_userlist', '.ProfileUserList');
    optionsMap.set('hide_others_photorail', '.PhotoRail');
    optionsMap.set('hide_your_tweet_impressions', '.TweetImpressionsModule');
    return optionsMap;
}

function getSearchResultsOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap(), ...getCommentOptionsMap()]);
    optionsMap.set('hide_search_top_news', '.AdaptiveNewsSmallImageHeadline, .AdaptiveNewsLargeImageHeadline');
    optionsMap.set('hide_search_related_news', '.AdaptiveNewsRelatedHeadlines');
    optionsMap.set('hide_search_related', '.AdaptiveRelatedSearches');
    return optionsMap;
}

function getSearchHomeOptionsMap() {
    var optionsMap = new Map(getNavigationBarOptionsMap());
    optionsMap.set('hide_trend_button', '.Trends');
    optionsMap.set('hide_footer', '.Footer');
    return optionsMap;
}

function getSettingsOptionsMap() {
    var optionsMap = new Map();
    optionsMap.set('hide_your_profile_summary', '.DashboardProfileCard');
    return optionsMap;
}

function enableVisibilityProperty(selector) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.setProperty('visibility', 'visible');
    }
}

function enableDisplayProperty(selector) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.setProperty('display', 'block');
    }
}

function watchForNewArrivals(selector, action) {
    document.unbindArrive(selector);
    document.arrive(selector, function() {
        action(this);
    });
}

// Compare the dom to what the user chose to hide, and show everything else
function showElementsBasedOnSettings(optionsMap) {
    chrome.storage.sync.get('options', function(result) {
        var selectors = (result == undefined || result.options == undefined)
            ? Array.from(optionsMap.values())
            : Array.from(optionsMap.keys()).filter(id => !result.options.includes(id)).map(id => optionsMap.get(id));
        if (selectors.length > 0) {
            enableVisibilityProperty(selectors.join(','));
            if (selectors.includes(optionsMap.get('hide_other_comments'))) {
                enableDisplayProperty('.replies-to');
                watchForNewArrivals('.replies-to', function(element) {
                    element.style.setProperty('display', 'block');
                });
                watchForNewArrivals('.ProfileTweet-actionCount', function(element) {
                    element.style.setProperty('visibility', 'visible');
                });
            }
            var hideMedia = optionsMap.get('hide_media_content');
            if (selectors.includes(hideMedia)) {
                enableDisplayProperty(hideMedia);
                watchForNewArrivals(hideMedia, function(element) {
                    element.style.setProperty('display', 'block');
                });
            }
            var topNews = optionsMap.get('hide_search_top_news');
            if (selectors.includes(topNews)) {
                enableDisplayProperty(topNews);
            }
        }
    });
}

// Look at the current URL path, so we only compare those dom elements that are on the page
//  (there's no sense in comparing/showing anything that's not there anyway, like hiding comments on the search results page)
function modifyTwitterPageDom() {
    var urlPath = new URL(location.href).pathname;
    switch (urlPath) {
        case '/':
            showElementsBasedOnSettings(getMainTimelineOptionsMap());
            break;
        case '/search':
            showElementsBasedOnSettings(getSearchResultsOptionsMap());
            break;
        case '/search-home':
        case '/search-advanced':
            showElementsBasedOnSettings(getSearchHomeOptionsMap());
            break;
        default:
            if (urlPath.startsWith('/hashtag/')) {
                showElementsBasedOnSettings(getSearchResultsOptionsMap());
            } else if (urlPath.startsWith('/settings/')) {
                showElementsBasedOnSettings(getSettingsOptionsMap());
            } else {
                /*   /someuser/status/234923492384
                     /someuser
                     /i/notifications
                     /i/moments               */
                 showElementsBasedOnSettings(getOthersTimelineOptionsMap());
            }
            break;
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.event) {
        case 'tab_updated':
            modifyTwitterPageDom();
            break;
        case 'tab_updating':
            chrome.runtime.sendMessage({event: "ping_reply"});
            break;
    }
});
