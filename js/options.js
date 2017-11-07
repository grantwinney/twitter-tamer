var optionIds = ['hide_home_link','hide_moments','hide_notifications','hide_messages','hide_bird_icon','hide_search','hide_profile_dropdown','hide_tweet_button',
                 'hide_trend_button','hide_who_to_follow','hide_live_video','hide_your_tweet_impressions','hide_footer',
                 'hide_your_profile_summary','hide_your_profile_stats','hide_comments',
                 'hide_others_profile_header','hide_others_profile_card','hide_others_profile_navigation','hide_others_profile_userlist','hide_others_photorail',
                 'hide_search_adaptive_filters','hide_search_top_news','hide_search_related_news','hide_search_filter','hide_search_related','hide_search_term'];

function loadOptions() {
    chrome.storage.sync.get('options', function(result) {
        if (result != undefined && result.options != undefined) {
            result.options.forEach(function(id) {
                document.getElementById(id).checked = true;
            });
        }
    });
}

function saveOptions() {
    var options = [];
    optionIds.forEach(function(id) {
        if (document.getElementById(id).checked) {
            options.push(id);
        }
    });
    chrome.storage.sync.set({'options': options});
}

function showPane(paneToShow) {
    document.getElementById('options').style.setProperty('display', paneToShow === 'options' ? 'inline' : 'none');
    document.getElementById('options-menu-item').style.setProperty('text-decoration', paneToShow === 'options' ? 'underline' : 'none');
    document.getElementById('support').style.setProperty('display', paneToShow === 'support' ? 'inline' : 'none');
    document.getElementById('support-menu-item').style.setProperty('text-decoration', paneToShow === 'support' ? 'underline' : 'none');
}

window.addEventListener('DOMContentLoaded', function load(event) {
    loadOptions();
    document.getElementById('version').innerHTML = '&copy; 2017, ver ' + chrome.runtime.getManifest().version
    document.getElementById('options-menu-item').addEventListener('click', function(e) { e.preventDefault(); showPane('options') });
    document.getElementById('support-menu-item').addEventListener('click', function(e) { e.preventDefault(); showPane('support') });
    document.getElementById('save').addEventListener('click', function(e) { saveOptions(); });
});
