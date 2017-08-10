import ext from "./utils/ext";
import storage from "./utils/storage";

const popup = document.getElementById("app");
const programId = document.getElementById("programId");
const programName = document.getElementById("programName");

const errorSection      = document.getElementById("errorSection");
const programSection    = document.getElementById("programSection");
const linkSection    = document.getElementById("linkSection");
const linkInput    = document.getElementById("linkInput");
const copyLink    = document.getElementById("copyLink");
const statisticSection  = document.getElementById("statisticSection");
const footerSection     = document.getElementById("footerSection");

const applyNow     = document.getElementById("applyNow");
const getCreatives     = document.getElementById("getCreatives");
const getVouchers     = document.getElementById("getVouchers");
const getTrackingLink     = document.getElementById("getTrackingLink");
const getDeeplink     = document.getElementById("getDeeplink");

const confirmedText     = document.getElementById("confirmedText");
const openText          = document.getElementById("openText");
const cancelledText     = document.getElementById("cancelledText");



const translateHtmlElements = document.getElementsByClassName("translateHtml");

let currentUrl = '';

hide(programSection);
hide(linkSection);
hide(statisticSection);
hide(footerSection);
show(errorSection);

ext.tabs.query({active: true, currentWindow: true}, function (tabs) {

    if (tabs.length && tabs[0].url) {
        const currentUrl = tabs[0].url;


        // if tab badge === 'i => has Program
        // if tab badgeBG Color  === #007239 => has partnership

        ext.browserAction.getBadgeText({tabId: tabs[0].id}, function(result) {

            // no program
            if (result !== 'i') {
                hide(programSection);
                return
            }

            // has program
            ext.runtime.sendMessage({action: "get-programDetails"}, onGetProgramDetailsResponse);

            // has partnership?
            ext.browserAction.getBadgeBackgroundColor({tabId: tabs[0].id}, function(badgeColorResult) {
                // red color is is DE1C44 => 222 / 28 ...
                if (badgeColorResult[0] === 222 && badgeColorResult[1] === 28) {
                    // no partnership
                    show(applyNow);
                    hide(getCreatives);
                    hide(getVouchers);
                    hide(getTrackingLink);
                    hide(getDeeplink);
                } else {
                    // has partnership
                    show(programSection);
                    hide(applyNow);
                    hide(getTrackingLink);
                    hide(getDeeplink);

                    popuplateLink(programDetails, currentUrl);
                }
            });
        })

    }
});


function onGetProgramDetailsResponse(response) {
    console.log('in on get program response', response);
    if (response.programDetails && response.programDetails.programId) {
        setProgramDetails(response.programDetails);
        show(programSection);
    } else {
        hide(programSection)
    }
}

// will be executed every time the popup is opened!
storage.get(['confirmed', 'open', 'cancelled', 'publisherId', 'webservicePassword', 'countryPlatform'], function(response) {
    if(response.confirmed) {
        confirmedText.innerText = response.confirmed;
        show(statisticSection);
        show(footerSection);
    }
    if(response.open) {
        openText.innerText = response.open;
        show(statisticSection);
        show(footerSection);
    }
    if(response.cancelled) {
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
        if (e.target.matches("#settings") || e.target.matches("#settings2") ||  e.target.matches("#settings3")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "settings"}});
        }
        else if (e.target.matches("#logo")) {
            ext.runtime.sendMessage({action: "open-link", data: {link: "https://www.affili.net/"}});
        }
        else if (e.target.matches("#news")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "news"}});
        }
        else if (e.target.matches("#statistics")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "orders"}});
        }
        else if (e.target.matches("#applyNow")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "applynow/" + programId.getAttribute('value')} });
        }
        else if (e.target.matches("#getCreatives")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "getCreatives/" + programId.getAttribute('value') }});
        }
        else if (e.target.matches("#getVouchers")) {
            ext.runtime.sendMessage({action: "open-page", data: {page: "getVouchers/" + programId.getAttribute('value') }});
        }
        else if (e.target.matches("#getDeeplink") || e.target.matches("#getTrackingLink")) {
            show(linkSection);
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

function popuplateLink(programDetails, currentUrl) {
    console.log('pop deeplink', programDetails, currentUrl);
    storage.get(['programsWithDeeplink', 'publisherId' , 'countryPlatform'], function(storageResult) {
        if (
            !storageResult.hasOwnProperty('programsWithDeeplink')
            && !storageResult.hasOwnProperty('publisherId')
            && !storageResult.hasOwnProperty('countryPlatform')
        ) {
            hide(getTrackingLink);
            hide(getDeeplink);
            return;
        }

        let deeplinkInfo = storageResult.programsWithDeeplink.find((entry) => entry.programId === programDetails.programId);
        console.log(deeplinkInfo);
        if(deeplinkInfo) {
            // has deeplink

            let url = generateDeeplink(storageResult.publisherId, deeplinkInfo, currentUrl);
            linkInput.setAttribute('value', url);
            hide(getTrackingLink);
            show(getDeeplink);

        } else {

            let url = generateDefaultTextLink(storageResult.publisherId, programDetails, storageResult.countryPlatform);
            linkInput.setAttribute('value', url);
            show(getTrackingLink);
            hide(getDeeplink);
        }

    });
}

function generateDeeplink(publisherId, deeplinkInfo, deeplink) {

    let params = deeplinkInfo.params;
    let trackingLink = deeplinkInfo.trackingLink;
    let redirector = deeplinkInfo.redirector;

    // do not just append the parameters, we might have a URI Hash
    const deeplinkParser = document.createElement('a');
    deeplinkParser.href = deeplink;


    // parameter forwarding
    if (params !== '') {
        if (deeplinkParser.search.indexOf('?') === -1) {
            deeplinkParser.search += '?' + params
        } else {
            deeplinkParser.search += '&' + params
        }
    }

    // redirect form tracking url to attribution solution?
    if (redirector !== '') {
        // do not directly redirect to advertiser
        trackingLink = redirector.replace('[deeplink]',  encodeURIComponent(deeplinkParser.href))
    }

    trackingLink = trackingLink.replace('[deeplink]', encodeURIComponent(deeplinkParser.href));
    trackingLink = trackingLink.replace('[ref]', publisherId);
    trackingLink = trackingLink.replace('[paramforwarding]', '');

    return trackingLink;
}


function generateDefaultTextLink(publisherId, programDetails, countryPlatform) {

    let link = 'http://' + getHostnameForPlatform(countryPlatform) + '/click.asp';
    link += "?site=" + programDetails.programId;
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

linkInput.addEventListener('focus', function(){
    this.setSelectionRange(0, this.value.length);
    document.execCommand('copy');
});

copyLink.addEventListener('click', function() {
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