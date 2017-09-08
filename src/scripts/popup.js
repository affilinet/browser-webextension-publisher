import ext from "./utils/ext";
import storage from "./utils/storage";

const popup = document.getElementById("app");
const programId = document.getElementById("programId");
const programName = document.getElementById("programName");

const errorSection = document.getElementById("errorSection");
const programSection = document.getElementById("shopSection");
const linkSection = document.getElementById("linkSection");
const linkInput = document.getElementById("linkInput");
const copyLink = document.getElementById("copyLink");
const statisticSection = document.getElementById("statisticSection");
const footerSection = document.getElementById("toolsSection");

const applyNow = document.getElementById("applyNow");
const getCreatives = document.getElementById("getCreatives");
const getVouchers = document.getElementById("getVouchers");
const getTrackingLink = document.getElementById("getTrackingLink");
const getDeeplink = document.getElementById("getDeeplink");
const noDeeplinkSupport = document.getElementById("noDeeplinkSupport");

const confirmedText = document.getElementById("confirmedText");
const openText = document.getElementById("openText");
const cancelledText = document.getElementById("cancelledText");


const translateHtmlElements = document.getElementsByClassName("translateHtml");

let currentUrl = '';

hide(programSection);
hide(linkSection);
hide(statisticSection);
hide(footerSection);
show(errorSection);

ext.tabs.query({active: true, currentWindow: true}, function (tabs) {

    if (tabs.length && tabs[0].url) {
        currentUrl = tabs[0].url;


        // if tab badge === 'i => has Program
        // if tab badgeBG Color  === #007239 => has partnership

        ext.browserAction.getBadgeText({tabId: tabs[0].id}, function (result) {

            // no program
            if (result !== 'i') {
                hide(programSection);
                return
            }

            // has program
            // has partnership?
            ext.browserAction.getBadgeBackgroundColor({tabId: tabs[0].id}, function (badgeColorResult) {
                // red color is is DE1C44 => 222 / 28 ...

                let hasPartnership = false;
                if (badgeColorResult[0] !== 222 && badgeColorResult[1] !== 28) {
                    hasPartnership = true;
                }

                ext.runtime.sendMessage({action: "get-programDetails"}, (response) => {
                    onGetProgramDetailsResponse(response, hasPartnership);
                    if (hasPartnership === false) {

                        show(applyNow);
                        hide(getCreatives);
                        hide(getVouchers);
                        hide(getTrackingLink);
                        hide(noDeeplinkSupport);
                        hide(getDeeplink);
                    } else {
                        // has partnership
                        hasPartnership = true;
                        show(programSection);
                        hide(applyNow);
                        hide(getTrackingLink);
                        hide(getDeeplink);
                        hide(noDeeplinkSupport);
                    }
                });
            });
        })

    }
});


function onGetProgramDetailsResponse(response, hasPartnership) {
    console.log('in on get program response', response);
    if (response.programDetails && response.programDetails.programId) {
        setProgramDetails(response.programDetails);
        if (hasPartnership) {
            popuplateLink(response.programDetails.programId);
        }
        show(programSection);
    } else {
        hide(programSection)
    }
}

// will be executed every time the popup is opened!
storage.get(['confirmed', 'open', 'cancelled', 'publisherId', 'webservicePassword', 'countryPlatform'], function (response) {
    if (response.confirmed) {
        confirmedText.innerText = response.confirmed;
        show(statisticSection);
        show(footerSection);
    }
    if (response.open) {
        openText.innerText = response.open;
        show(statisticSection);
        show(footerSection);
    }
    if (response.cancelled) {
        cancelledText.innerText = response.cancelled;
        show(statisticSection);
        show(footerSection);
    }
    if (response.publisherId && response.webservicePassword && response.countryPlatform) {
        hide(errorSection);
    }
});


popup.addEventListener("click", function (e) {
    e.preventDefault();

    if (e.target) {
        console.log(e.target);

        if (e.target.matches(".linksettings")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "settings"}});
        }
        else if (e.target.matches(".linklogo")) {
            ext.runtime.sendMessage({action: "open-link", data: {link: "https://www.affili.net/"}});
        }
        else if (e.target.matches(".linknews")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "news"}});
        }
        else if (e.target.matches(".linkstatistics")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "orders"}});
        }
        else if (e.target.matches(".linkapplyNow")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "applynow/" + programId.getAttribute('value')}});
        }
        else if (e.target.matches(".linkgetCreatives")) {
            ext.runtime.sendMessage({
                action: "open-page",
                data: {page: "getCreatives/" + programId.getAttribute('value')}
            });
        }
        else if (e.target.matches(".linkgetVouchers")) {
            ext.runtime.sendMessage({
                action: "open-page",
                data: {page: "getVouchers/" + programId.getAttribute('value')}
            });
        }
        else if (e.target.matches(".linkgetDeeplink") || e.target.matches(".linkgetTrackingLink")) {
            show(linkSection);
        }
        else if (e.target.matches(".linklikeList")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "likeList"}});
        }
        else if (e.target.matches(".linkwidgetGenerator")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "widget"}});
        }
        else if (e.target.matches(".linksearchDiscover")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "searchDiscover"}});
        }

        else if (e.target.matches(".linkaddToWebsitePins")) {
            ext.runtime.sendMessage({action: "save-current-tab-in-like-list"});
            ext.runtime.sendMessage({action: "open-page", data: {page: "likeList?tab=1"}});
        }
    }
    return true;
});

// translate on initial load
for (let i = 0; i < translateHtmlElements.length; i++) {
    translateHtmlElements[i].innerText = ext.i18n.getMessage(translateHtmlElements[i].getAttribute('data-translateKey'));
}


function hide(htmlElement) {
    htmlElement.classList.add('hidden');
}

function show(htmlElement) {
    htmlElement.classList.remove('hidden');
}

function setProgramDetails(programDetails) {
    console.log('programDetails', programDetails);

    programId.setAttribute('value', programDetails.programId ? programDetails.programId : '');
    programName.innerText = programDetails.programTitle ? programDetails.programTitle : '';
}

function popuplateLink(programId) {
    console.log('pop deeplink', programId);
    storage.get(['programsWithDeeplink', 'publisherId', 'countryPlatform'], function (storageResult) {
        if (
            !storageResult.hasOwnProperty('programsWithDeeplink')
            && !storageResult.hasOwnProperty('publisherId')
            && !storageResult.hasOwnProperty('countryPlatform')
        ) {
            hide(getTrackingLink);
            hide(getDeeplink);
            return;
        }

        let deeplinkInfo = storageResult.programsWithDeeplink.find((entry) => entry.programId === programId && entry.platform !== '');
        console.log('found deeplink info', deeplinkInfo);
        if (deeplinkInfo) {
            // has deeplink
            console.log('gen deeplink');
            let url = generateDeeplink(storageResult.publisherId, deeplinkInfo);
            linkInput.setAttribute('value', url);
            hide(getTrackingLink);
            hide(noDeeplinkSupport);
            show(getDeeplink);

        } else {
            console.log('gen default link');
            let url = generateDefaultTextLink(storageResult.publisherId, programId, storageResult.countryPlatform);
            linkInput.setAttribute('value', url);
            show(getTrackingLink);
            show(noDeeplinkSupport);
            hide(getDeeplink);
        }

    });
}

function generateDeeplink(publisherId, deeplinkInfo) {

    let params = deeplinkInfo.params;

    let trackingLink = deeplinkInfo.trackingLink;
    // do not just append the parameters, we might have a URI Hash
    const deeplinkParser = document.createElement('a');
    deeplinkParser.href = currentUrl;

    // parameter forwarding
    if (params !== '') {
        if (deeplinkParser.search.indexOf('?') === -1) {
            deeplinkParser.search += '?' + params
        } else {
            deeplinkParser.search += '&' + params
        }
    }
    let finalUrl = deeplinkParser.href;

    // redirect form tracking url to attribution solution?
    if (deeplinkInfo.hasOwnProperty('redirector')) {
        if (deeplinkInfo.redirector !== '') {
            // do not directly redirect to advertiser
            finalUrl = deeplinkInfo.redirector + encodeURIComponent(finalUrl);
        }
    }

    trackingLink = trackingLink.replace('[deeplink]', encodeURIComponent(finalUrl));
    trackingLink = trackingLink.replace('[ref]', publisherId);
    trackingLink = trackingLink.replace('[paramforwarding]', '');
    return trackingLink;
}


function generateDefaultTextLink(publisherId, programId, countryPlatform) {

    console.log(publisherId, programId, countryPlatform);
    let link = 'http://' + getHostnameForPlatform(countryPlatform) + '/click.asp';
    link += "?site=" + programId;
    link += "&ref=" + publisherId;
    link += "&type=text&tnb=1";
    return link
}

function getHostnameForPlatform(countryPlatform) {
    switch (countryPlatform) {
        case 'DE':
        case 'AT':
        case 'CH':
            return 'partners.webmasterplan.com';
        case 'UK':
            return 'being.successfultogether.co.uk';
        case 'FR':
            return 'clic.reussissonsensemble.fr';
        case 'NL':
            return 'zijn.samenresultaat.nl';
        default :
            console.error('No platform identifier given');
            return 'partners.webmasterplan.com';
    }
}

linkInput.addEventListener('focus', function () {
    this.setSelectionRange(0, this.value.length);
    document.execCommand('copy');
});

copyLink.addEventListener('click', function () {
    linkInput.select();
    copyLink.classList.remove('success');
    try {
        let successful = document.execCommand('copy');

        if (successful) {
            copyLink.classList.add('success');
        }

    } catch (err) {
        console.log('Oops, unable to copy');
    }
});