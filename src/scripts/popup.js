import ext from "./utils/ext";
import storage from "./utils/storage";

const popup = document.getElementById("app");
const programId = document.getElementById("programId");
const programName = document.getElementById("programName");

const errorSection      = document.getElementById("errorSection");
const programSection    = document.getElementById("programSection");
const statisticSection  = document.getElementById("statisticSection");
const footerSection     = document.getElementById("footerSection");

const applyNow     = document.getElementById("applyNow");
const getCreatives     = document.getElementById("getCreatives");
const getVouchers     = document.getElementById("getVouchers");

const confirmedText     = document.getElementById("confirmedText");
const openText          = document.getElementById("openText");
const cancelledText     = document.getElementById("cancelledText");



const translateHtmlElements = document.getElementsByClassName("translateHtml");


hide(programSection);
hide(statisticSection);
hide(footerSection);
show(errorSection);

ext.tabs.query({active: true, currentWindow: true}, function (tabs) {

    if (tabs.length && tabs[0].url) {
        const url = tabs[0].url;

        // if tab badge === 'i => has Program
        // if tab badgeBG Color  === #007239 => has partnership

        const parsedHostname = getHostNameForUrl(url);

        ext.browserAction.getBadgeText({tabId: tabs[0].id}, function(result) {

            if (result === 'i') {
                // get program for url
                show(programSection);

                storage.get('allPrograms', function(result) {

                    const fullObject = result.allPrograms;

                    let details = {};

                    if (fullObject) {
                        details = fullObject.filter(function( obj ) {
                            return obj['parsedHost'] === parsedHostname;
                        })[ 0 ];
                    }

                    setProgramDetails(details);

                });
                ext.browserAction.getBadgeBackgroundColor({tabId: tabs[0].id}, function(result) {
                    // red color is is DE1C44 => 222 / 28 ...
                    if (result[0] === 222 && result[1] === 28) {
                        // no partnership
                        show(applyNow);
                        hide(getCreatives);
                        hide(getVouchers);
                    } else {
                        // has partnership
                        show(programSection);
                        hide(applyNow);
                        show(getCreatives);
                        show(getVouchers);
                    }
                });
            } else {

                // no program
                hide(programSection);
            }
        })

    }
});




// will be executed every time the popup is opened!
storage.get(['confirmed', 'open', 'cancelled', 'publisherId', 'webservicePassword'], function(response) {
    if(response.confirmed) {
        confirmedText.innerHTML = response.confirmed;
        show(statisticSection);
        show(footerSection);
    }
    if(response.open) {
        openText.innerHTML = response.open;
        show(statisticSection);
        show(footerSection);
    }
    if(response.cancelled) {
        cancelledText.innerHTML = response.cancelled;
        show(statisticSection);
        show(footerSection);
    }
    if (response.publisherId && response.webservicePassword) {
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

    }
});

// translate on initial load
for (let i = 0; i < translateHtmlElements.length; i++) {
    translateHtmlElements[i].innerHTML = ext.i18n.getMessage(translateHtmlElements[i].getAttribute('data-translateKey'));
}



function hide(htmlElement) {
    htmlElement.classList.add('hidden');
}
function show(htmlElement) {
    htmlElement.classList.remove('hidden');
}

function setProgramDetails(programDetails) {
    programId.setAttribute('value', programDetails.programId ? programDetails.programId : '');
    programName.innerHTML = programDetails.title ? programDetails.title : '';
}

function getHostNameForUrl(string) {
    const parser = document.createElement('a');
    parser.href = string;
    return parser.host
}