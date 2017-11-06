var navOptionIds = ['hide_home_link','hide_moments','hide_notifications','hide_messages',
                    'hide_bird_icon','hide_search','hide_profile_dropdown','hide_tweet_button'];
var optionIds = ['hide_nav_bar','hide_your_profile_summary','hide_your_profile_stats',
                 'hide_others_profile_header','hide_others_profile_card','hide_others_profile_navigation','hide_others_profile_userlist','hide_others_photorail',
                 'hide_trend_button','hide_who_to_follow','hide_live_video','hide_your_tweet_impressions','hide_footer','hide_comments',
                 'hide_search_navigation','hide_search_top_news','hide_search_related_news','hide_search_filter','hide_search_user_gallery','hide_search_related'].concat(navOptionIds);

function loadOptions() {
    optionIds.forEach(function(id) {
        chrome.storage.sync.get(id, function(result) {
            document.getElementById(id).checked = (result != undefined && result[id] == true);
        });
    });
}

function checkBox(id, select) {
    document.getElementById(id).checked = select;
    chrome.storage.sync.set({[id]: select});
}

function registerOptionClicks() {
    optionIds.forEach(function(id) {
        document.getElementById(id).addEventListener('click', function() {
            chrome.storage.sync.set({[id]: document.getElementById(id).checked});
            if (id == 'hide_nav_bar' && document.getElementById(id).checked) {
                navOptionIds.forEach(function(iid) { checkBox(iid, true) });
            } else if (navOptionIds.includes(id) && document.getElementById('hide_nav_bar').checked) {
                checkBox('hide_nav_bar', false);
            } else if (id == 'hide_your_profile_summary' && document.getElementById('hide_your_profile_summary').checked) {
                checkBox('hide_your_profile_stats', true);
            } else if (id == 'hide_your_profile_stats' && !document.getElementById('hide_your_profile_stats').checked) {
                checkBox('hide_your_profile_summary', false);
            }
        });
    });
}

function showPane(paneToShow) {
    document.getElementById('options').style.setProperty('display', paneToShow === 'options' ? 'inline' : 'none');
    document.getElementById('options-menu-item').style.setProperty('text-decoration', paneToShow === 'options' ? 'underline' : 'none');
    document.getElementById('support').style.setProperty('display', paneToShow === 'support' ? 'inline' : 'none');
    document.getElementById('support-menu-item').style.setProperty('text-decoration', paneToShow === 'support' ? 'underline' : 'none');
}

window.addEventListener('DOMContentLoaded', function load(event) {
    loadOptions();
    registerOptionClicks();
    document.getElementById('version').innerHTML = '&copy; 2017, ver ' + chrome.runtime.getManifest().version
    document.getElementById('options-menu-item').addEventListener('click', function(e) { e.preventDefault(); showPane('options') });
    document.getElementById('support-menu-item').addEventListener('click', function(e) { e.preventDefault(); showPane('support') });
});
