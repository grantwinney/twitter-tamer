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

function getMainTimelineOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap()]);
    optionsMap.set('hide_your_profile_summary', '.DashboardProfileCard');
    optionsMap.set('hide_your_profile_stats', '.ProfileCardStats-statList');
    optionsMap.set('hide_comments', '.inline-reply-tweetbox, .replies-to, .ProfileTweet-action--reply, .Icon--reply');
    return optionsMap;
}

function getOthersTimelineOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap()]);
    optionsMap.set('hide_others_profile_header', '.ProfileCanopy-header');
    optionsMap.set('hide_others_profile_card', '.ProfileHeaderCard');
    optionsMap.set('hide_others_profile_navigation', '.ProfileCanopy-navBar');
    optionsMap.set('hide_others_profile_userlist', '.ProfileUserList');
    optionsMap.set('hide_others_photorail', '.PhotoRail-heading, .PhotoRail-mediaBox');
    optionsMap.set('hide_your_tweet_impressions', '.TweetImpressionsModule');
    optionsMap.set('hide_comments', '.inline-reply-tweetbox, .replies-to, .ProfileTweet-action--reply, .Icon--reply');
    return optionsMap;
}

function getSearchResultsOptionsMap() {
    var optionsMap = new Map([...getNavigationBarOptionsMap(), ...getSideBarOptionsMap()]);
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

function hideElements(elements) {
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.setProperty('display', 'none', 'important');
    };
}

function hidePageElements(optionsMap) {
    document.unbindArrive('.ProfileTweet-action--reply');
    chrome.storage.sync.get('options', function(result) {
        if (result != undefined && result.options != undefined) {
            hideElements(document.querySelectorAll(result.options.filter(id => optionsMap.has(id))
                                                                 .map((id) => optionsMap.get(id))
                                                                 .join(',')));
            if (result.options['hide_comments'] != undefined) {
                document.arrive('.ProfileTweet-action--reply', {onceOnly: true}, function() {
                    hideElements(document.querySelectorAll('.ProfileTweet-action--reply'));
                });
            }
        }
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // message.event == 'pageload'
    var url = new URL(location.href);
    switch(url.pathname) {
        case '/':
            hidePageElements(getMainTimelineOptionsMap());
            break;
        case '/search':
            hidePageElements(getSearchResultsOptionsMap());
            break;
        case '/search-home':
        case '/search-advanced':
            hidePageElements(getSearchHomeOptionsMap());
            break;
        default:
            /*   /someuser/status/234923492384
                 /someuser
                 /i/notifications
                 /i/moments                      */
            hidePageElements(getOthersTimelineOptionsMap());
            break;
    }
});
