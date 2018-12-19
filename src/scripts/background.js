import ext from "./utils/ext";
import storage from "./utils/storage";
import PublisherWebservice from "../scripts/services/publisherWebservice";
import Papa from "../scripts/services/papaparse.min";


let settingsPageTabId = null;
let currentPageProgramDetails = [];
let globalHasPartnership = false;
let globalHasProgram = false;
let globalHasProgramPartnerShipAndDeeplink = false;

const linkShortener =  'https://productwidget.com/api/v1.0/shortlink';


ext.runtime.onMessage.addListener(
    function (request,  sender, sendResponse) {
        console.log('message received', request);
        switch (request.action) {
            case "open-popup" :
                console.log(request.data.tabs);
                break;
            case "update-programData" :
                forceUpdateData();
                break;
            case "open-page" :
                openPage(request.data.page);
                break;

            case "copyImageCode" :
                copyImageCode(request.data, sendResponse);

                break;
            case "copyDeeplink" :
                generateTrackingUrl(request.data.uri).then( (deeplink) => {
                    console.log('copy deeplink', deeplink);
                    _copyTextToClipboard(deeplink);
                    sendResponse(true);
                });
                break;

            case "shorten-link" :
                shortenLink(request.data.link, sendResponse);
                break;

            case "hasProgramPartnershipAndDeeplink" :
                sendResponse(globalHasProgramPartnerShipAndDeeplink);
                break;
            case "save-in-like-list" :
                 _saveInLikeList(request.data, sendResponse);
                 break;

            case "share-on-twitter" :
                return generateTrackingUrl(request.data.uri).then( (redirectUrl) => {
                    console.log('redirect url = ', redirectUrl);
                    let url = 'https://twitter.com/share?url=' + encodeURIComponent(redirectUrl) + '&text=' + encodeURIComponent(request.data.pageTitle);
                    ext.tabs.create({url: url});
                });

            case "share-on-facebook" :
                return generateTrackingUrl(request.data.uri).then( (redirectUrl) => {
                    let url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(redirectUrl)  ;
                    ext.tabs.create({url: url});
                });
            case "share-on-pinterest" :
                return generateTrackingUrl(request.data.uri).then( (redirectUrl) => {
                    let url = 'https://pinterest.com/pin/create/bookmarklet/?media=' + encodeURIComponent(request.data.image.src) + '&url=' + encodeURIComponent(redirectUrl) + '&description=' + encodeURIComponent(request.data.pageTitle);
                    ext.tabs.create({url: url});
                });
            case "share-on-google" :
                return generateTrackingUrl(request.data.uri).then( (redirectUrl) => {
                    let url = 'https://plus.google.com/share?url=' + encodeURIComponent(redirectUrl) ;
                    ext.tabs.create({url: url});
                });
            case "open-link" :
                ext.tabs.create({url: request.data.link});
                break;
            case 'clear-cache':
                console.log('received clear cache');
                PublisherWebservice.Reset();
                break;

            case 'save-current-tab-in-like-list':
                return _saveCurrentTabInLikeList(sendResponse);
                break;

            case 'get-programDetails':
                ext.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

                    // since only one tab should be active and in the current window at once
                    // the return variable should only have one entry
                    var activeTab = arrayOfTabs[0];
                    hasProgram(getCleanedHostnameforUrl(activeTab.url))
                        .then(
                            (programDetails) => {
                                sendResponse({programDetails : programDetails});
                            },
                            (error) => {
                                sendResponse({programDetails : false})
                            });
                })
                break;
            case 'get-programDetailsForProgramId':
                getDetailsForProgramId(request.data.programId)
                    .then(
                        (programDetails) => {
                            sendResponse(programDetails);
                        },
                        (error) => {
                            sendResponse(false)
                        });
                return true;
                break;

            case 'save-credentials' :
                console.log('received save credentials');
                PublisherWebservice.UpdateCredentials(
                    request.data.publisherId,
                    request.data.webservicePassword
                );
                storage.set({
                    publisherId: request.data.publisherId,
                    webservicePassword: request.data.webservicePassword,
                    countryPlatform: request.data.countryPlatform,
                    disableImageContextMenu: request.data.disableImageContextMenu,
                    productWebservicePassword: request.data.productWebservicePassword
                });
                // reload all programs
                PublisherWebservice.Reset();
                PublisherWebservice.UpdateMyPrograms();
                PublisherWebservice.GetPublisherSummary().then(
                    (publisherSummary) => {
                        updatePublisherSummary(publisherSummary)
                    },
                    (error) => console.debug(error));

                forceUpdateData()

                break;
        }
        return true;
    }

);

function  copyImageCode(data, sendResponse){
    generateTrackingUrl(data.uri).then( (deeplink) => {
        let code = '<a href="' + deeplink +  '" target="_blank" rel="nofollow"><img src="' + data.image.src +'"></a>';
        console.log('copy image code', code);
        _copyTextToClipboard(code)
        sendResponse(true);
    });
}
function _saveCurrentTabInLikeList(sendResponse) {
    console.log('in _saveCurrentTabInLikeList ');

    ext.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        var activeTab = arrayOfTabs[0];
        console.log(activeTab);

        let data = {
            image: {
                src: activeTab.favIconUrl,
                width: 16,
                height: 16,
                alt: activeTab.title,
                title: activeTab.title,
            },
            type : 'link',
            uri: activeTab.url,
            pageTitle: activeTab.title,
            createdAt: +new Date()
        };
        _saveInLikeList(data, sendResponse);
    })
}

function _saveInLikeList(data, sendResponse) {
    storage.get('likeList', (result) => {
        let list = [];
        if (result.likeList) {
            list = result.likeList
        }
        list.push(data);
        storage.set({likeList: list});
        sendResponse({message: 'Added to LikeList' });
    })
}

function generateTrackingUrl(url) {

    return new Promise((resolve, reject) => {
        hasProgram(getCleanedHostnameforUrl(url)).then(
            (programDetails) => {
                if (programDetails === false) {
                    resolve(url)

                } else {
                    hasPartnership(programDetails.programId).then(
                        (hasPartnershipResult) => {
                            if (hasPartnershipResult === true) {
                                hasDeeplink(programDetails.programId).then(
                                    (result) => {
                                      if (result.deeplinkInfo === false || result.publisherId === null) {
                                            resolve(url);
                                        } else {
                                            resolve(generateDeeplink(url, result.publisherId, result.deeplinkInfo))
                                        }
                                    }
                                )
                            } else {
                                resolve(url);
                            }
                        }
                    )
                }
            }
        )
    });
}

function shortenLink(url, sendResponse) {

    let xhr = new XMLHttpRequest();
    xhr.open('POST', linkShortener);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            let linkInfo = JSON.parse(xhr.responseText);
            sendResponse(linkInfo.link);
        } else {
            sendResponse(false);
        }
    };
    xhr.send(JSON.stringify({
        link: url
    }));


}


function generateDeeplink(url, publisherId, deeplinkInfo) {

    console.log('in gen deeplink', url, publisherId, deeplinkInfo);
    let params = deeplinkInfo.params;


    let trackingLink = deeplinkInfo.trackingLink;
    // do not just append the parameters, we might have a URI Hash
    const deeplinkParser = document.createElement('a');
    deeplinkParser.href = url;

    // parameter forwarding
    if (params !== '') {
        if (deeplinkParser.search.indexOf('?') === -1) {
            deeplinkParser.search += '?' + params
        } else {
            deeplinkParser.search += '&' + params
        }
    }
    let finalUrl = deeplinkParser.href;


    if (deeplinkInfo.hasOwnProperty('programId')) {
      // special workaround for media markt
      if (deeplinkInfo.programId === '16901') {
        finalUrl = finalUrl.replace("%2B","%25252B");
      }

      // special workaround for otto
      if (deeplinkInfo.programId === '2950') {
        finalUrl =  finalUrl.replace(/^https?:\/\/.*otto\.de\//,"");
      }
    }


    // redirect tracking url to attribution solution?
    if (deeplinkInfo.hasOwnProperty('redirector')) {
        if (deeplinkInfo.redirector !== '') {
            // do not directly redirect to advertiser

            // should the redirector param be url encoded?
            // partners.webmasterplan.com/?diurl=http://redirector.com/?url={endocedOrUnencodedUrl}
            if (!deeplinkInfo.hasOwnProperty('urlencodeRedirectorUrl') || deeplinkInfo.urlencodeRedirectorUrl === 'true') {
                finalUrl = deeplinkInfo.redirector + encodeURIComponent(finalUrl);
            } else {
                finalUrl = deeplinkInfo.redirector + finalUrl;
            }

        }
    }

    trackingLink = trackingLink.replace('[deeplink]', encodeURIComponent(finalUrl)); // always encode the parameter for partners.webmasterplan
    trackingLink = trackingLink.replace('[ref]', publisherId);
    trackingLink = trackingLink.replace('[paramforwarding]', '');
    return trackingLink;
}


function _copyTextToClipboard(text) {
    let copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    let body = document.body;
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

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
                url: ext.extension.getURL('/settings-page/index.html#' + page)
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
                        url: ext.extension.getURL('/settings-page/index.html#' + page),
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
    const host = parser.host.replace('www.', '');
    return '//' + host;
}

/**
 *  Show if  there is a partnership with the current URI- host
 *
 * @param hasPartnership
 * @param tabId
 */
function setHasPartnership(hasPartnership, tabId) {
    if (hasPartnership) {
        globalHasPartnership = true;
        ext.browserAction.setBadgeBackgroundColor({color: '#007239', tabId: tabId})
    } else {
        globalHasPartnership = false;
        globalHasProgramPartnerShipAndDeeplink = false;
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
        globalHasProgram = true;
        ext.browserAction.setBadgeText({text: 'i', tabId: tabId})
    } else {
        globalHasProgram = false;
        globalHasProgramPartnerShipAndDeeplink = false;
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
    hasPartnership(programId).then(
        (hasPartnership) => {
            console.log('programId hasPartnership', hasPartnership);
            setHasPartnership(hasPartnership, tabId);
            if (hasPartnership === true) {
                checkHostHasDeeplink(programId, tabId);
            }
        }
    );
}

function hasDeeplink(programId) {
    return new Promise((resolve, reject) => {
        storage.get(['programsWithDeeplink', 'publisherId'], (storageResult) => {
            let deeplinkInfo = storageResult.programsWithDeeplink.find((entry) => entry.programId === programId && entry.platform !== '');
            resolve({deeplinkInfo: deeplinkInfo, publisherId: storageResult.publisherId})
        });
    })

}
function checkHostHasDeeplink(programId, tabId){
    hasDeeplink(programId).then(
        (result) => {
            console.log('programId hasDeeplink', result);
            globalHasProgramPartnerShipAndDeeplink = !!result.deeplinkInfo;
        }
    )
}

function hasProgram(hostname) {
    return new Promise((resolve,reject) => {
        storage.get(['allPrograms', 'countryPlatform'], function (result) {
            if (!result.allPrograms) {
                resolve(false);
            } else {

                // find program in allPrograms
                let programIndex = result.allPrograms.findIndex((program) => {
                    if (program.platformId !== result.countryPlatform) return false;
                    return (hostname.endsWith('/' + program.programUrl)  === true || hostname.endsWith('.' + program.programUrl)  === true  )
                });
                if (programIndex >= 0 ) {
                    resolve(result.allPrograms[programIndex]);
                } else {
                    resolve(false);
                }
            }
        });
    })
}


function getDetailsForProgramId(programId) {
    return new Promise((resolve,reject) => {
        storage.get(['allPrograms', 'countryPlatform'], function (result) {
            if (!result.allPrograms) {
                console.error('allPrograms not loaded');
                resolve(false);
            } else {
                // find program in allPrograms
                let programIndex = result.allPrograms.findIndex((program) => {
                    return +program.programId === +programId && program.platformId === result.countryPlatform
                });
                if (programIndex > 0 ) {
                    console.log('programs found ', result.allPrograms[programIndex]);
                    resolve(result.allPrograms[programIndex]);
                } else {
                    console.error('programs not found loaded');
                    resolve(false);
                }
            }
        });
    })
}

function hasPartnership(programId){
    return new Promise((resolve, rejcet) => {
        storage.get(['myPrograms'], function (result) {
            if (!result.myPrograms) {
                resolve(false);
            } else {
                for (let i = 0; i < result.myPrograms.length; i++) {
                    if (result.myPrograms[i].programId === programId) {
                        resolve(true);
                        return
                    }
                }
                resolve(false);
            }
        });
    });
}

/**
 * Hast this hostname a program?
 *
 * @param hostname
 * @param tabId
 */
function checkHostHasProgram(hostname, tabId) {
    hasProgram(hostname).then(
        (programInfo) => {
            console.log('hostname has program', hostname, programInfo);
            setHasProgram(programInfo, tabId);
            if (programInfo !== false) {
                checkHostHasPartnership(programInfo.programId, tabId );
            }
        }
    )
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
            console.log('info about tab with hostname', hostname)
            if (hostname !== 'newtab' && hostname !== null && hostname !== '' && hostname !== getCleanedHostnameforUrl(ext.extension.getURL(''))) {
                checkHostHasProgram(hostname, tabs[0].id)
            }
        }
    });
}

function updateProgramsWithDeeplink() {
    console.log('downloading all programs with deeplink');
    Papa.parse('https://raw.githubusercontent.com/affilinet/browser-webextension-publisher/master/resources/deeplinks.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('Updated all programsWithDeeplink');
            storage.set({
                programsWithDeeplink: results.data
            })
        }
    });
}

function updateAllPrograms() {
    console.log('downloading all programs');
    Papa.parse("https://raw.githubusercontent.com/affilinet/browser-webextension-publisher/master/resources/programs.csv", {
        download: true,
        header: true,
        complete: (results) =>  {
            console.log('Updated all programs');
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
            forceUpdateData()
        } else {
            console.log('All Programs and Programs with deeplink is fresh; Last update was',
                new Date(storageResult.lastDailyDataUpdate));
            console.log('Next update of  Programs and Programs at',
                new Date(storageResult.lastDailyDataUpdate +  (24 * 60 *60 *1000)));
        }
    });
}
function forceUpdateData() {
    console.log('update my programs from webserice')
    PublisherWebservice.UpdateMyPrograms();
    console.log('updateProgramsWithDeeplink');
    updateProgramsWithDeeplink();
    console.log('updateAllPrograms');
    updateAllPrograms();
    console.log('set lastDailyDataUpdate');
    storage.set({
        lastDailyDataUpdate : Date.now()
    })
}



/**
 * Inititally load all Programs and MyPrograms
 * Start loading 2 seconds after program start to improve browser startup speed
 */
window.setTimeout(function () {

    // update now
    forceUpdateData();

    // update data all 15 min
    setInterval(updateData, 15 * 60 * 1000); // 15 mins

}, 2000);







