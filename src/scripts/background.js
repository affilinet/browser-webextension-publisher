import ext from "./utils/ext";
import storage from "./utils/storage";
import PublisherWebservice from "../scripts/services/publisherWebservice";
import Papa from "../scripts/services/papaparse.min";


let settingsPageTabId = null;
let currentPageProgramDetails = [];


ext.runtime.onMessage.addListener(
    function (request,  sender, sendResponse) {
        switch (request.action) {
            case "open-popup" :
                console.log(request.data.tabs);
                break;
            case "open-page" :
                openPage(request.data.page);
                break;
            case "open-link" :
                ext.tabs.create({url: request.data.link});
                break;
            case 'clear-cache':
                console.log('received clear cache');
                PublisherWebservice.Reset();
                storage.clear();
                break;

            case 'get-programDetails':
                console.log('programDetails');
                return sendResponse({programDetails : currentPageProgramDetails});
                break;
            case 'save-credentials' :
                console.log('received save credentials');
                storage.clear();
                PublisherWebservice.UpdateCredentials(
                    request.data.publisherId,
                    request.data.webservicePassword
                );
                storage.set({
                    publisherId: request.data.publisherId,
                    webservicePassword: request.data.webservicePassword,
                    countryPlatform: request.data.countryPlatform
                });
                // reload all programs
                PublisherWebservice.Reset();
                PublisherWebservice.UpdateMyPrograms();
                PublisherWebservice.GetPublisherSummary().then(
                    (publisherSummary) => {
                        updatePublisherSummary(publisherSummary)
                    },
                    (error) => console.debug(error));

                importAllPrograms();
                importProgramsWithDeeplink();

                break;
        }
        return true;
    }

);


/**
 * * Listener on tab close if settings page is opened  - workaround for edge
 * @param tabId
 */
let onSettingsPageTabClose = function (tabId) {
    if (tabId === settingsPageTabId) {
        settingsPageTabId = null;
        ext.tabs.onRemoved.removeListener(onSettingsPageTabClose);
        ext.tabs.onUpdated.removeListener(onSettingsPageTabUpdated);
    }
}

/**
 * Listener on tab changes if settings page is opened  - workaround for edge
 * @param tabId
 * @param changeInfo
 */
let onSettingsPageTabUpdated = function (tabId, changeInfo) {
    if (tabId === settingsPageTabId) {
        if (changeInfo.url && (changeInfo.url.indexOf(ext.extension.getURL('')) === -1 )) {
            // settings page tab.. url changed to other domain (not showing settings page anymore)
            settingsPageTabId = null;
            ext.tabs.onUpdated.removeListener(onSettingsPageTabUpdated);
            ext.tabs.onRemoved.removeListener(onSettingsPageTabClose);
        }
    }
}

function openPage(page) {

    ext.windows.getCurrent(function (currentWindow, test) {

        if (settingsPageTabId === null) {
            ext.tabs.create({
                url: ext.extension.getURL('/settings-page/index.html#!/' + page)
            }, function (tab) {

                settingsPageTabId = tab.id;
                ext.tabs.onUpdated.addListener(onSettingsPageTabUpdated);
                ext.tabs.onRemoved.addListener(onSettingsPageTabClose);
            });
        } else {
            // move the tab to current window and make it active
            ext.tabs.move(settingsPageTabId, {
                windowId: ext.windows.WINDOW_ID_CURRENT,
                index: -1
            }, function (window) {
                ext.tabs.update(settingsPageTabId,
                    {
                        url: ext.extension.getURL('/settings-page/index.html#!/' + page),
                        active: true,
                    }, function (tab) {

                    });

            });

        }

    })


}

let updateStatisticsInPopup = function (current, open, cancelled) {
    ext.runtime.sendMessage({action: "popup-stats", data: {current: current, open: open, cancelled: cancelled}});
}



/**
 * @tdodo move to a service class
 * @param string
 * @returns {Document}
 */
function getXml(string) {
    const parser = new DOMParser();
    return parser.parseFromString(string, "application/xml");
}

function updatePublisherSummary(apiResponseString) {
    const xmlDoc = getXml(apiResponseString);

    let root = xmlDoc.getElementsByTagName('PublisherSummary')[0];
    const CurrentMonth = root.getElementsByTagName("a:CurrentMonth")[0];

    if (typeof CurrentMonth !== 'undefined') {

        let confirmed = CurrentMonth.getElementsByTagName("a:Confirmed")[0].firstChild.nodeValue;
        let open = CurrentMonth.getElementsByTagName("a:Open")[0].firstChild.nodeValue;
        let cancelled = CurrentMonth.getElementsByTagName("a:Cancelled")[0].firstChild.nodeValue;

        PublisherWebservice.GetLinkedAccounts().then(function (linkedAccountsResponse) {

            const linkedAccountsRoot = getXml(linkedAccountsResponse);
            let currency = linkedAccountsRoot.getElementsByTagName('a:Currency')[0].firstChild.nodeValue;
            let loc = 'de-DE';

            if (currency === null || currency === undefined) {
                currency = 'EUR';
            } else if (currency === 'GBP') {
                loc = 'en-gb';
            } else if (currency === 'CHF') {
                loc = 'de-ch';
            }

            if (confirmed === undefined) {
                confirmed = ' ';
            } else {
                confirmed = parseFloat(confirmed).toLocaleString(loc, {
                    localeMatcher: 'best fit',
                    style: 'currency',
                    currency: currency
                });
            }
            if (open === undefined) {
                open = ' ';
            } else {
                open = parseFloat(open).toLocaleString(loc, {
                    localeMatcher: 'best fit',
                    style: 'currency',
                    currency: currency
                });
            }
            if (cancelled === undefined) {
                cancelled = ' ';
            } else {
                cancelled = parseFloat(cancelled).toLocaleString(loc, {
                    localeMatcher: 'best fit',
                    style: 'currency',
                    currency: currency
                });
            }

            updateStatisticsInPopup(confirmed, open, cancelled);
            storage.set({
                confirmed: confirmed,
                open: open,
                cancelled: cancelled,
                ApiLocale: loc,
                Currency: currency
            });

        }, console.error);


    }
}


/**
 * Extract the hostname from an URI
 * @param string
 */
function getCleanedHostnameforUrl(string) {
    const parser = document.createElement('a');
    parser.href = string;
    let host = parser.host;
    host = host.replace('www.', '');
    return host;
}

/**
 *  Show if  there is a partnership with the current URI- host
 *
 * @param hasPartnership
 * @param tabId
 */
function setHasPartnership(hasPartnership, tabId) {
    if (hasPartnership) {
        ext.browserAction.setBadgeBackgroundColor({color: '#007239', tabId: tabId})
    } else {
        ext.browserAction.setBadgeBackgroundColor({color: '#DE1C44', tabId: tabId})
    }
}

/**
 * Show if the current URI has a affilinet Advertiser Program
 *
 * @param hasProgram
 * @param tabId
 */
function setHasProgram(hasProgram, tabId) {
    if (hasProgram) {
        ext.browserAction.setBadgeText({text: 'i', tabId: tabId})
    } else {
        ext.browserAction.setBadgeText({text: '', tabId: tabId})
    }
}

/**
 * Update the plugin Button for the hostname
 *
 * We do NOT call any API with the currently visited URL
 * Simply check if the hostname is in all known hostnames / my Programs hostnames
 *
 * @param programId
 * @param tabId
 */
function checkHostHasPartnership(programId, tabId) {
    storage.get(['myPrograms'], function (result) {
        if (!result.myPrograms) {
            setHasPartnership(false, tabId);
        } else {
            for (let i = 0; i < result.myPrograms.length; i++) {
                if (result.myPrograms[i].programId === programId) {
                    setHasPartnership(true, tabId);
                    return
                }
            }
            setHasPartnership(false, tabId);
        }
    });
}

/**
 * Hast this hostname a program?
 *
 * @param hostname
 * @param tabId
 */
function checkHostHasProgram(hostname, tabId) {
    storage.get(['allPrograms', 'countryPlatform'], function (result) {
        if (!result.allPrograms) {
            console.log('allPrograms not in storage');
            setHasProgram(false, tabId);
        } else {
            // does program exist?
            currentPageProgramDetails = [];

            // find program in allPrograms
            let programIndex = result.allPrograms.findIndex((program) => {
                return program.platformId === result.countryPlatform && hostname.search(program.programUrl) >= 0
            });

            if (programIndex > 0 ) {
                console.log(result.allPrograms[programIndex]);
                currentPageProgramDetails = result.allPrograms[programIndex];
                setHasProgram(true, tabId);
                checkHostHasPartnership(result.allPrograms[programIndex].programId, tabId )
            } else {
                setHasProgram(false, tabId);
            }


        }
    });
}

/**
 * On tab open: Check for Program/Partnership
 */

ext.windows.onFocusChanged.addListener(getInfoaboutTab);
ext.tabs.onHighlighted.addListener(getInfoaboutTab);
ext.tabs.onAttached.addListener(getInfoaboutTab);

ext.tabs.onUpdated.addListener(function(tab, changes) {
    if (changes.url) {
        getInfoaboutTab();
    }

});

/**
 * Take the hostname of the URL
 * Check if this hostname is included in "myPrograms" or is included in "All Programs"
 *
 */
function getInfoaboutTab() {
    ext.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs.length) {
            const hostname = getCleanedHostnameforUrl(tabs[0].url);

            if (hostname !== 'newtab' && hostname !== null && hostname !== '' && hostname !== getCleanedHostnameforUrl(ext.extension.getURL(''))) {
                checkHostHasProgram(hostname, tabs[0].id)
            }
        }
    });
}

function importProgramsWithDeeplink() {
    Papa.parse('../data/deeplinks.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('imported deeplink programs');
            storage.set({programsWithDeeplink: results.data })
        }
    });
}

function importAllPrograms() {
    Papa.parse('../data/programs.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('imported programs');
            storage.set({
                allPrograms : results.data,
            })
        }
    });
}



function updateProgramsWithDeeplink() {
    console.log('downloading all programs with deeplink');
    Papa.parse('https://raw.githubusercontent.com/affilinet/browser-webextension-publisher/master/resources/deeplinks.csv', {
        download: true,
        header: true,
        complete: function(results) {
            storage.set({programsWithDeeplink: results.data })
        }
    });
}

function updateAllPrograms() {
    console.log('downloading all programs');
    Papa.parse("https://raw.githubusercontent.com/affilinet/browser-webextension-publisher/master/resources/programs.csv", {
        download: true,
        header: true,
        complete: (results) =>  {
            console.log('LOADED all programs');
            storage.set({
                allPrograms : results.data,
            })
        }
    });
}


function updateData () {
    PublisherWebservice.GetPublisherSummary().then(updatePublisherSummary, console.debug);

    // all Programs and Programs with deeplinks get updated daily
    storage.get(['lastDailyDataUpdate'], function(storageResult) {
        const timestampMS = Date.now();
        if (!storageResult.lastDailyDataUpdate || storageResult.lastDailyDataUpdate < timestampMS - (24 * 60 *60 *1000)) {
            // last update is longer ago than one day!
            PublisherWebservice.UpdateMyPrograms();
            updateProgramsWithDeeplink();
            updateAllPrograms();
            storage.set({
                lastDailyDataUpdate : timestampMS
            })
        }
    });
}
/**
 * Inititally load all Programs and MyPrograms
 * Start loading 2 seconds after program start to improve browser startup speed
 */
window.setTimeout(function () {

    // import All Programs|Programs with deeplink from file for a fast start
    importAllPrograms();
    importProgramsWithDeeplink();

    // update data all 15 min
    setInterval(updateData, 15 * 60 * 1000); // 15 mins

    // update now
    updateData();

}, 2000);







