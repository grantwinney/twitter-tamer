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
    chrome.storage.local.get(id, function(result) {
        if (result != undefined && result[id] == true) {
            action();
        }
    });
}

function handleAllOptions(navOptions, miscOptions) {
    var currentNavOption = navOptions.pop();
    chrome.storage.local.get(currentNavOption["key"], function(result) {
        if (result != undefined && result[currentNavOption["key"]] == true) {
            hideElements(document.querySelectorAll(currentNavOption["selector"]));
        } else {
            handleIndividualNavOptions(navOptions, [], function(selectorArray) {
                handleIndividualOptions(miscOptions, selectorArray, function(selectorArray) {
                    hideElements(document.querySelectorAll(selectorArray.join(',')));
                });
            });
        }
    });
}

function handleIndividualNavOptions(navOptions, selectorArray, finalAction) {
    var currentNavOption = navOptions.pop();
    chrome.storage.local.get(currentNavOption["key"], function(result) {
        if (result != undefined && result[currentNavOption["key"]] == true) {
            selectorArray.push(currentNavOption["selector"]);
        }
        if (navOptions.length > 0) {
            handleIndividualNavOptions(navOptions, selectorArray, finalAction);
        } else {
            finalAction(selectorArray);
        }
    });
}

function handleIndividualOptions(options, selectorArray, finalAction) {
    var currentOption = options.pop();
    chrome.storage.local.get(currentOption["key"], function(result) {
        if (result != undefined && result[currentOption["key"]] == true) {
            selectorArray.push(currentOption["selector"]);
        }
        if (options.length > 0) {
            handleIndividualOptions(options, selectorArray, finalAction);
        } else {
            finalAction(selectorArray);
        }
    });
}

function hidePageElements() {
    var navOptions = [];
    navOptions.push({key:'hide_home_link', selector:'#global-nav-home'});
    navOptions.push({key:'hide_moments', selector:'.moments'});
    navOptions.push({key:'hide_notifications', selector:'.notifications'});
    navOptions.push({key:'hide_messages', selector:'.dm-nav'});
    navOptions.push({key:'hide_bird_icon', selector:'.bird-topbar-etched'});
    navOptions.push({key:'hide_search', selector:'#global-nav-search'});
    navOptions.push({key:'hide_profile_dropdown', selector:'#user-dropdown'});
    navOptions.push({key:'hide_tweet_button', selector:'.topbar-tweet-btn'});
    navOptions.push({key:'hide_nav_bar', selector:'.global-nav'});

    var options = [];
    options.push({key:'hide_your_profile_summary', selector:'.DashboardProfileCard'});
    options.push({key:'hide_your_profile_stats', selector:'.ProfileCardStats-statList'});
    options.push({key:'hide_your_tweet_impressions', selector:'.TweetImpressionsModule'});
    options.push({key:'hide_others_profile_header', selector:'.ProfileCanopy-header'});
    options.push({key:'hide_others_profile_card', selector:'.ProfileHeaderCard'});
    options.push({key:'hide_others_profile_navigation', selector:'.ProfileCanopy-navBar'});
    options.push({key:'hide_others_profile_userlist', selector:'.ProfileUserList'});
    options.push({key:'hide_others_photorail', selector:'.PhotoRail-heading, .PhotoRail-mediaBox'});
    options.push({key:'hide_trend_button', selector:'.Trends'});
    options.push({key:'hide_who_to_follow', selector:'.wtf-module'});
    options.push({key:'hide_live_video', selector:'.LiveVideoHomePageModuleContainer'});
    options.push({key:'hide_footer', selector:'.Footer'});
    options.push({key:'hide_search_navigation', selector:'.SearchNavigation'});
    options.push({key:'hide_search_top_news', selector:'.AdaptiveNewsSmallImageHeadline, .AdaptiveNewsLargeImageHeadline'});
    options.push({key:'hide_search_related_news', selector:'.AdaptiveNewsRelatedHeadlines'});
    options.push({key:'hide_search_filter', selector:'.SidebarFilterModule'});
    options.push({key:'hide_search_related', selector:'.AdaptiveRelatedSearches'});
    options.push({key:'hide_comments', selector:'.inline-reply-tweetbox, .replies-to, .ProfileTweet-action--reply, .Icon--reply'});
    options.push({key:'hide_search_user_gallery', selector:'.AdaptiveSearchTimeline-separationModule'});

    handleAllOptions(navOptions, options);

    possiblyhide('hide_comments', function() {
        document.arrive('.ProfileTweet-action--reply', {onceOnly: true}, function() {
            hideElements(document.querySelectorAll('.ProfileTweet-action--reply'));
        });
    });
}

window.addEventListener('DOMContentLoaded', function load(event) {
    hidePageElements();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // message.event == 'pageload'
    hidePageElements();
});
