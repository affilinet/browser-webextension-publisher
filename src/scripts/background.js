import ext from "./utils/ext";
import storage from "./utils/storage";
import PublisherWebservice from "../scripts/services/publisherWebservice"

let settingsPageTabId = null;

ext.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('RECEIVED MESSAGE IN BACKGROUND PAGE');
        switch (request.action) {

            case "open-popup" :
                console.log(request.data.tabs);
                break;
            case "open-page" :
                openPage(request.data.page);
                break;
            case "open-link" :
                ext.tabs.create({url : request.data.link});
                break;
            case 'clear-cache':
                console.log('received clear cache');
                PublisherWebservice.Reset();
                storage.clear();
                break;
            case 'save-credentials' :
                console.log('received save credentials');
                storage.clear();
                PublisherWebservice.UpdateCredentials(request.data.publisherId, request.data.webservicePassword);
                storage.set({
                    publisherId: request.data.publisherId,
                    webservicePassword: request.data.webservicePassword
                });
                // reload all programs
                PublisherWebservice.Reset();
                PublisherWebservice.UpdateMyPrograms();
                PublisherWebservice.GetPublisherSummary().then(
                    (publisherSummary) =>  {
                        updatePublisherSummary(publisherSummary)
                    },
                    (error) => console.debug(error));
                PublisherWebservice.UpdateAllPrograms();
                break;
        }
    }
);

/**
 * * Listener on tab close if settings page is opened  - workaround for edge
 * @param tabId
 */
let onSettingsPageTabClose = function(tabId){
    if (tabId === settingsPageTabId) {
        settingsPageTabId = null;
        ext.tabs.onRemoved.removeListener(onSettingsPageTabClose);
        ext.tabs.onUpdated.removeListener(onSettingsPageTabUpdated);
        console.log('removed listener for settings page tag');
    }
}

/**
 * Listener on tab changes if settings page is opened  - workaround for edge
 * @param tabId
 * @param changeInfo
 */
let onSettingsPageTabUpdated = function(tabId, changeInfo){
    if (tabId === settingsPageTabId) {
        if (changeInfo.url && (changeInfo.url.indexOf(ext.extension.getURL('')) === -1 ) ) {
            // settings page tab.. url changed to other domain (not showing settings page anymore)
            settingsPageTabId = null;
            ext.tabs.onUpdated.removeListener(onSettingsPageTabUpdated);
            ext.tabs.onRemoved.removeListener(onSettingsPageTabClose);
            console.log('removed listener for settings page tag');
        }
    }
}

function openPage(page) {

    ext.windows.getCurrent(function(currentWindow, test){

        if (settingsPageTabId === null) {
            ext.tabs.create({
                url: ext.extension.getURL('/settings-page/index.html#!/' + page)
            }, function(tab) {

                settingsPageTabId = tab.id;
                ext.tabs.onUpdated.addListener(onSettingsPageTabUpdated);
                ext.tabs.onRemoved.addListener(onSettingsPageTabClose);
            });
        } else {
            // move the tab to current window and make it active
            ext.tabs.move(settingsPageTabId, {
                windowId: ext.windows.WINDOW_ID_CURRENT,
                index: -1
            }, function(window) {
                ext.tabs.update(settingsPageTabId,
                    {
                        url: ext.extension.getURL('/settings-page/index.html#!/' + page),
                        active: true,
                    }, function(tab) {

                    });

            });

        }

    })


}

let updateStatisticsInPopup = function(current, open, cancelled ) {
    ext.runtime.sendMessage({action: "popup-stats", data: { current: current, open: open , cancelled: cancelled}});
}

let setCurrentProgramInPopup = function(programId, name) {
    ext.runtime.sendMessage({action: "popup-program", data: { program: programId, name: name}});
}


function getXml(string) {
    const parser = new DOMParser();
    return parser.parseFromString(string, "application/xml");
}

function updatePublisherSummary(apiResponseString) {
    const xmlDoc =  getXml(apiResponseString);

    let root = xmlDoc.getElementsByTagName('PublisherSummary')[0];
    const CurrentMonth = root.getElementsByTagName("a:CurrentMonth")[0];

    if (typeof CurrentMonth !== 'undefined') {

        let confirmed =  CurrentMonth.getElementsByTagName("a:Confirmed")[0].firstChild.nodeValue;
        let open =  CurrentMonth.getElementsByTagName("a:Open")[0].firstChild.nodeValue;
        let cancelled =  CurrentMonth.getElementsByTagName("a:Cancelled")[0].firstChild.nodeValue;

        PublisherWebservice.GetLinkedAccounts().then(function(linkedAccountsResponse){

            const linkedAccountsRoot = getXml(linkedAccountsResponse);
            let currency = linkedAccountsRoot.getElementsByTagName('a:Currency')[0].firstChild.nodeValue;
            let loc = 'de-DE';

            if (currency === null || currency === undefined) {
                currency = 'EUR';
            }else if (currency === 'GBP') {
                loc = 'en-gb';
            }else if (currency === 'CHF') {
                loc = 'de-ch';
            }

            if (confirmed === undefined){
                confirmed = ' ';
            }else {
                confirmed = parseFloat(confirmed).toLocaleString(loc, {localeMatcher: 'best fit', style: 'currency', currency : currency});
            }
            if (open === undefined){
                open = ' ';
            }else {
                open = parseFloat(open).toLocaleString(loc, {localeMatcher: 'best fit', style: 'currency', currency : currency});
            }
            if (cancelled === undefined){
                cancelled = ' ';
            }else {
                cancelled = parseFloat(cancelled).toLocaleString(loc, {localeMatcher: 'best fit', style: 'currency', currency : currency});
            }

            updateStatisticsInPopup(confirmed, open, cancelled);
            storage.set({
                confirmed : confirmed ,
                open : open,
                cancelled : cancelled,
                ApiLocale : loc,
                Currency : currency
            });

        }, console.error);


    }
}


/**
 * Extract the hostname from an URI
 * @param string
 */
function getHostNameForUrl(string) {
    const parser = document.createElement('a');
    parser.href = string;
    return parser.host
}

/**
 *  Show if  there is a partnership with the current URI- host
 *
 * @param hasPartnership
 * @param tabId
 */
function setHasPartnership(hasPartnership, tabId) {
    console.log('hasPartnership', hasPartnership);
    if (hasPartnership) {
        ext.browserAction.setBadgeBackgroundColor({color: '#007239', tabId: tabId})
    } else {
        ext.browserAction.setBadgeBackgroundColor({color :'#DE1C44', tabId:  tabId})
    }
}

/**
 * Show if the current URI has a affilinet Advertiser Program
 *
 * @param hasProgram
 * @param tabId
 */
function setHasProgram(hasProgram, tabId) {
    console.log('hasProgram', hasProgram);
    if (hasProgram) {
        ext.browserAction.setBadgeText({text: 'i', tabId: tabId})
    } else {
        ext.browserAction.setBadgeText({text : '', tabId:tabId })
    }
}

/**
 * Update the plugin Button for the hostname
 *
 * We do NOT call any API with the currently visited URL
 * Simply check if the hostname is in all known hostnames / my Programs hostnames
 *
 * @param hostname
 * @param tabId
 */
function checkHostHasPartnership(hostname, tabId) {
    storage.get(['myPrograms'], function (result) {
        if (!result.myPrograms) {
            setHasPartnership(false,tabId);
            checkHostHasProgram(hostname, tabId)
        } else {
            for (let i = 0; i < result.myPrograms.length; i++) {
                if (result.myPrograms[i].parsedHost === hostname) {
                    setHasPartnership(true, tabId);
                    setHasProgram(true, tabId);
                    return
                }
            }
            // no partnership ... check for program
            setHasPartnership(false, tabId);
            checkHostHasProgram(hostname, tabId)
        }
    });
}

/**
 * Hast this hostname a program?
 *
 * @param hostname
 * @param tabId
 */
function checkHostHasProgram(hostname,tabId) {
    storage.get(['allProgramHosts'], function (result) {
        if (!result.allProgramHosts) {
            setHasProgram(false, tabId);
        }else {
            const n = result.allProgramHosts.search(hostname);
            setHasProgram(n > 0, tabId);
        }
    });
}

/**
 * On tab open: Check for Program/Partnership
 */

ext.windows.onFocusChanged.addListener(getInfoaboutTab);
ext.tabs.onHighlighted.addListener(getInfoaboutTab);
ext.tabs.onAttached.addListener(getInfoaboutTab);
ext.tabs.onUpdated.addListener(getInfoaboutTab);

/**
 * Take the hostname of the URL
 * Check if this hostname is included in "myPrograms" or is included in "All Programs"
 *
 */
function getInfoaboutTab() {
    ext.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs.length ) {
            const hostname = getHostNameForUrl(tabs[0].url);

            if (hostname !== 'newtab' && hostname !== null && hostname !== '' && hostname !== getHostNameForUrl(ext.extension.getURL(''))) {
                console.log(hostname);
                checkHostHasPartnership(hostname, tabs[0].id)
            }
        }
    });
}


/**
 * Inititally load all Programs and MyPrograms
 * Start loading 2 seconds after program start to improve browser loading speed
 */
window.setTimeout(function(){

    setInterval(function() {
        PublisherWebservice.UpdateMyPrograms();
    }, 24 * 60 * 60 * 1000); // daily

    setInterval(function() {
        PublisherWebservice.GetPublisherSummary().then(updatePublisherSummary, console.debug);
    }, 5 * 60 * 1000); // 5 mins


    setInterval(function() {
        PublisherWebservice.UpdateAllPrograms();
    }, 24 * 60 * 60 * 1000); // daily



    PublisherWebservice.GetPublisherSummary().then(updatePublisherSummary, console.debug);
    PublisherWebservice.UpdateAllPrograms();
    PublisherWebservice.UpdateMyPrograms();
},2000);
