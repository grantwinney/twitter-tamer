function getNavigationBarOptionsMap() {
    var optionsMap = new Map();
    optionsMap.set('hide_home_link', '#global-nav-home');
    optionsMap.set('hide_moments', '.moments');
    optionsMap.set('hide_notifications', '.notifications');
    optionsMap.set('hide_messages', '.dm-nav');
    optionsMap.set('hide_bird_icon', '.bird-topbar-etched');
    optionsMap.set('hide_search', '#global-nav-search');
    optionsMap.set('hide_profile_dropdown', '#user-dropdown');
    optionsMap.set('hide_tweet_button', '.topbar-tweet-btn');
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
    optionsMap.set('hide_other_comments', '.replies-to');
    optionsMap.set('hide_reply_comments', '.inline-reply-tweetbox, .ProfileTweet-action--reply, .Icon--reply');
    return optionsMap;
}

function getMainTimelineOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap(), ...getCommentOptionsMap()]);
    optionsMap.set('hide_your_profile_summary', '.DashboardProfileCard');
    optionsMap.set('hide_your_profile_stats', '.ProfileCardStats-statList');
    return optionsMap;
}

function getOthersTimelineOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap(), ...getCommentOptionsMap()]);
    optionsMap.set('hide_others_profile_header', '.ProfileCanopy-header');
    optionsMap.set('hide_others_profile_card', '.ProfileHeaderCard');
    optionsMap.set('hide_others_profile_navigation', '.ProfileCanopy-navBar, .ProfileCanopy-nav');
    optionsMap.set('hide_others_profile_userlist', '.ProfileUserList');
    optionsMap.set('hide_others_photorail', '.PhotoRail');
    optionsMap.set('hide_your_tweet_impressions', '.TweetImpressionsModule');
    return optionsMap;
}

function getSearchResultsOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap(), ...getCommentOptionsMap()]);
    optionsMap.set('hide_search_adaptive_filters', '.AdaptiveFiltersBar');
    optionsMap.set('hide_search_top_news', '.AdaptiveNewsSmallImageHeadline, .AdaptiveNewsLargeImageHeadline');
    optionsMap.set('hide_search_related_news', '.AdaptiveNewsRelatedHeadlines');
    optionsMap.set('hide_search_filter', '.SidebarFilterModule');
    optionsMap.set('hide_search_related', '.AdaptiveRelatedSearches');
    optionsMap.set('hide_search_term', '.SearchNavigation-canopy');
    return optionsMap;
}

function getSearchHomeOptionsMap() {
    var optionsMap = new Map(getNavigationBarOptionsMap());
    optionsMap.set('hide_trend_button', '.Trends');
    optionsMap.set('hide_footer', '.Footer');
    return optionsMap;
}

// Compare the dom elements to user settings, and show anything they didn't choose to hide
function showPageElementsNotSelectedForHiding(elementSelectorsToShow) {
    var elementsToShow = document.querySelectorAll(elementSelectorsToShow.join(','));
    for (var i = 0; i < elementsToShow.length; i++) {
        var classNames = elementsToShow[i].className.split(' ');
        if (classNames.includes('ProfileCanopy-header') || classNames.includes('replies-to')) {
            elementsToShow[i].style.setProperty('display', 'block');
        } else {
            elementsToShow[i].style.setProperty('visibility', 'visible');
        }
    }
}

// If any child elements are visible in the global nav bar, show the bar; otherwise leave it hidden
function showTopNavBarIfAnyChildElementsVisible(elementSelectorsToShow) {
    var e = elementSelectorsToShow;
    if (e.includes('.moments') || e.includes('.notifications') || e.includes('.dm-nav')
        || e.includes('.bird-topbar-etched') || e.includes('.topbar-tweet-btn') || e.includes('#global-nav-home')
        || e.includes('#global-nav-search') || e.includes('#user-dropdown'))
    {
        var elements = document.getElementsByClassName('topbar');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.setProperty('display', 'block');
        }
    }
}

// If the canopy header (large image) is hidden, dock the profile canopy nav bar to the global nav bar,
//  to avoid a display issue where the canopy nav bar slips behind the global nav bar
function dockProfileCanopyNavBarToGlobalNavBar(elementSelectorsToShow) {
    if (!elementSelectorsToShow.includes('.ProfileCanopy-header')
        && elementSelectorsToShow.includes('.ProfileCanopy-navBar, .ProfileCanopy-nav')) {
        var elements = document.querySelectorAll('.ProfileCanopy-navBar, .ProfileCanopy-nav');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.setProperty('position', 'fixed');
            elements[i].style.setProperty('z-index', '1000');
            elements[i].style.setProperty('width', '100%');
        }
    }
}

// Compare the dom to what the user chose to hide, and take actions on elements that should be displayed
function showElementsBasedOnSettings(optionsMap) {
    chrome.storage.sync.get('options', function(result) {
        if (result != undefined && result.options != undefined) {
            var elementSelectorsToShow = Array.from(optionsMap.keys()).filter(id => !result.options.includes(id)).map((id) => optionsMap.get(id));
            if (elementSelectorsToShow.length > 0) {
                showPageElementsNotSelectedForHiding(elementSelectorsToShow);
                showTopNavBarIfAnyChildElementsVisible(elementSelectorsToShow);
                dockProfileCanopyNavBarToGlobalNavBar(elementSelectorsToShow);
            }
        }
    });
}

// Look at the current URL path, so we only compare those dom elements that are on the page
//  (there's no sense in comparing/showing anything that's not there anyway, like hiding comments on the search results page)
function modifyTwitterPageDom() {
    var urlPath = new URL(location.href).pathname;
    switch(urlPath) {
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

// This event is executed every time the 'chrome.tabs.onUpdated' event fires
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // message.event == 'pageload'
    modifyTwitterPageDom();
});

// The 'popstate' event should fire when the user navigates backward and forward,
//  since it seemed the 'chrome.tabs.onUpdated' event didn't always fire in that case
window.addEventListener('popstate', function(event) {
    modifyTwitterPageDom();
}, false);
