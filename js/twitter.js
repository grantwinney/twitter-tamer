function hideElement(element) {
    if (element != undefined) {
        element.style.setProperty('display', 'none', 'important');
    }
}

function hideElements(elements) {
    if (elements != undefined) {
        for (var i = 0; i < elements.length; i++) {
            hideElement(elements[i]);
        };
    }
}

function possiblyhide(id, action) {
    chrome.storage.sync.get(id, function(result) {
        if (result != undefined && result[id] == true) {
            action();
        }
    });
}

function pageload() {
    chrome.storage.sync.get('hide_nav_bar', function(result) {
        if (result != undefined && result['hide_nav_bar'] == true) {
            hideElements(document.getElementsByClassName('global-nav'));
        } else {
            possiblyhide('hide_home_link', function() {hideElement(document.getElementById('global-nav-home'))});
            possiblyhide('hide_moments', function() {hideElements(document.getElementsByClassName('moments'))});
            possiblyhide('hide_notifications', function() {hideElements(document.getElementsByClassName('notifications'))});
            possiblyhide('hide_messages', function() {hideElements(document.getElementsByClassName('dm-nav'))});
            possiblyhide('hide_bird_icon', function() {hideElements(document.getElementsByClassName('bird-topbar-etched'))});
            possiblyhide('hide_search', function() {hideElement(document.getElementById('global-nav-search'))});
            possiblyhide('hide_profile_dropdown', function() {hideElement(document.getElementById('user-dropdown'))});
            possiblyhide('hide_tweet_button', function() {hideElements(document.getElementsByClassName('topbar-tweet-btn'))});
        }
    });
    possiblyhide('hide_your_profile_summary', function() {hideElements(document.getElementsByClassName('DashboardProfileCard'))});
    possiblyhide('hide_your_profile_stats', function() {hideElements(document.getElementsByClassName('ProfileCardStats-statList'))});
    possiblyhide('hide_your_tweet_impressions', function() {hideElements(document.getElementsByClassName('TweetImpressionsModule'))});
    possiblyhide('hide_others_profile_header', function() {hideElements(document.getElementsByClassName('ProfileCanopy'))});
    possiblyhide('hide_others_profile_card', function() {hideElements(document.getElementsByClassName('ProfileHeaderCard'))});
    possiblyhide('hide_others_profile_navigation', function() {hideElements(document.getElementsByClassName('ProfileCanopy-navBar'))});
    possiblyhide('hide_others_profile_userlist', function() {hideElements(document.getElementsByClassName('ProfileUserList'))});
    possiblyhide('hide_others_photorail', function() {hideElements(document.querySelectorAll('.PhotoRail-heading, .PhotoRail-mediaBox'))});
    possiblyhide('hide_trend_button', function() {hideElements(document.getElementsByClassName('Trends'))});
    possiblyhide('hide_who_to_follow', function() {hideElements(document.getElementsByClassName('wtf-module'))});
    possiblyhide('hide_live_video', function() {hideElements(document.getElementsByClassName('LiveVideoHomePageModuleContainer'))});
    possiblyhide('hide_footer', function() {hideElements(document.getElementsByClassName('Footer'))});
    possiblyhide('hide_search_navigation', function() {hideElements(document.getElementsByClassName('SearchNavigation'))});
    possiblyhide('hide_search_top_news', function() {hideElements(document.querySelectorAll('.AdaptiveNewsSmallImageHeadline, .AdaptiveNewsLargeImageHeadline'))});
    possiblyhide('hide_search_related_news', function() {hideElements(document.getElementsByClassName('AdaptiveNewsRelatedHeadlines'))});
    possiblyhide('hide_search_filter', function() {hideElements(document.getElementsByClassName('SidebarFilterModule'))});
    possiblyhide('hide_search_related', function() {hideElements(document.getElementsByClassName('AdaptiveRelatedSearches'))});
    possiblyhide('hide_comments', function() {
        hideElements(document.querySelectorAll('.inline-reply-tweetbox, .replies-to, .ProfileTweet-action--reply, .Icon--reply'))
        document.arrive('.ProfileTweet-action--reply', {onceOnly: true}, function() {
            hideElements(document.querySelectorAll('.ProfileTweet-action--reply'));
        });
    });
    possiblyhide('hide_search_user_gallery', function() {hideElements(document.getElementsByClassName('AdaptiveSearchTimeline-separationModule'))});
}

window.addEventListener('DOMContentLoaded', function load(event) {
    pageload();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.event) {
        case 'pageload':
            pageload();
            break;
    }
});
