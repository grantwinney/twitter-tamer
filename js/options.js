function loadOptions() {
    chrome.storage.sync.get('options', function(result) {
        if (result != undefined && result.options != undefined) {
            result.options.forEach(function(id) {
                document.getElementById(id).checked = true;
                if (id == 'left_banner' || id == 'right_banner' || id == 'main') {
                    document.getElementById(`${id}_details`).classList.add('disabled_option');
                }
            });
        }
    });
}

function saveOptions() {
    let selectedOptionIds = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(x => x.id);
    chrome.storage.sync.set({'options': selectedOptionIds});
}

function showPane(paneToShow) {
    document.getElementById('options').style.setProperty('display', paneToShow === 'options' ? 'inline' : 'none');
    document.getElementById('options-menu-item').style.setProperty('text-decoration', paneToShow === 'options' ? 'underline' : 'none');
    document.getElementById('support').style.setProperty('display', paneToShow === 'support' ? 'inline' : 'none');
    document.getElementById('support-menu-item').style.setProperty('text-decoration', paneToShow === 'support' ? 'underline' : 'none');
}

function registerBannerSectionHeaderClick(bannerId) {
    document.getElementById(bannerId).addEventListener('click', function(e) {
        document.getElementById(`${bannerId}_details`).className = (e.srcElement.checked ? 'disabled_option' : '')
    });
}

function resetOptions() {
    if (chrome.extension.getBackgroundPage().confirm('This will reset the settings for this extension. Are you sure?')) {
        chrome.storage.sync.clear(function() {
            location.reload();
        });
    }
}

window.addEventListener('DOMContentLoaded', function load(event) {
    registerBannerSectionHeaderClick('left_banner');
    registerBannerSectionHeaderClick('right_banner');
    registerBannerSectionHeaderClick('main');
    document.getElementById('version').innerHTML = `&copy; 2017-${new Date().getFullYear()}, ver ${chrome.runtime.getManifest().version}`
    document.getElementById('options-menu-item').addEventListener('click', function(e) { e.preventDefault(); showPane('options') });
    document.getElementById('support-menu-item').addEventListener('click', function(e) { e.preventDefault(); showPane('support') });
    document.getElementById('save').addEventListener('click', function(_e) { saveOptions(); });
    document.getElementById('reset').addEventListener('click', function(_e) { resetOptions(); });
    loadOptions();
});
