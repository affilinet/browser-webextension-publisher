import storage from "../utils/storage";


let publisherId = null;
let webservicePassword = null;

storage.get('publisherId', function (results) {
        publisherId = results['publisherId'] || null
    }
);
storage.get('webservicePassword', function (results) {
        webservicePassword = results['webservicePassword'] || null
    }
);


let token = false;
let validUntil = false;

function getXml(string) {
    let parser = new DOMParser();
    return parser.parseFromString(string, "application/xml");
}

function getHostNameForUrl(string) {
    const parser = document.createElement('a');
    parser.href = string;
    return parser.host
}

function getQueryParam(name, url) {
    try {
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    catch (Error) {
        return '';
    }
}

function _sendRequest(requestBody, url, soap_action) {
    return new Promise(function (resolve, reject) {
        console.log('new xhr', url, soap_action);
        const xhr = new XMLHttpRequest();

        xhr.onloadend = function (event) {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            }
            else {
                console.debug('ERROR response with status ' + xhr.status);
                console.debug(xhr.response);
                reject(xhr);
            }
        };
        xhr.open('post', url); // event listeners musst be attached before!
        xhr.setRequestHeader("SOAPAction", soap_action);
        xhr.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
        xhr.send(requestBody);
    });

}


let _tokenMustBeRefreshed = function () {
    if (token === false) {
        console.log('token is not set');
        return true;
    }
    return validUntil === false || validUntil < (Math.floor(Date.now() / 1000) - 120);

};

let getToken = function () {
    return new Promise(function (resolve, reject) {
        "use strict";
        if (_tokenMustBeRefreshed()) {
            Logon().then(
                function success(response) {
                    let xmlDoc = getXml(response);
                    let localToken = xmlDoc.getElementsByTagName('CredentialToken')[0].firstChild.nodeValue;
                    token = localToken;
                    validUntil = Math.floor(Date.now());
                    resolve(localToken);
                },
                function error(response) {
                    console.log('error getting token');
                    reject(response);
                }
            )
        } else {
            resolve(token);
        }
    });
};

let _removeToken = function () {
    token = false;
    validUntil = false;
};


let generateBodyForAllPrograms = function (token, page) {

    return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
        '<soapenv:Header/>' +
        '<soapenv:Body>' +
        '<svc:GetProgramsRequest>' +
        '<svc:CredentialToken>' + token + '</svc:CredentialToken>' +
        '<svc:DisplaySettings><pub:CurrentPage>' + page + '</pub:CurrentPage><pub:PageSize>100</pub:PageSize></svc:DisplaySettings>' +
        '<svc:GetProgramsQuery>' +

        '<pub:PartnershipStatus>' +
        '<pub:ProgramPartnershipStatusEnum>Active</pub:ProgramPartnershipStatusEnum>' +
        '<pub:ProgramPartnershipStatusEnum>Paused</pub:ProgramPartnershipStatusEnum>' +
        '<pub:ProgramPartnershipStatusEnum>Waiting</pub:ProgramPartnershipStatusEnum>' +
        '<pub:ProgramPartnershipStatusEnum>Cancelled</pub:ProgramPartnershipStatusEnum>' +
        '<pub:ProgramPartnershipStatusEnum>NoPartnership</pub:ProgramPartnershipStatusEnum>' +
        '<pub:ProgramPartnershipStatusEnum>Refused</pub:ProgramPartnershipStatusEnum>' +
        '</pub:PartnershipStatus>' +
        '</svc:GetProgramsQuery>' +
        '</svc:GetProgramsRequest>' +
        '</soapenv:Body>' +
        '</soapenv:Envelope>';
};


let generateBodyForMyPrograms = function (token, page) {
    "use strict";
    return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
        '<soapenv:Header/>' +
        '<soapenv:Body>' +
        '<svc:GetProgramsRequest>' +
        '<svc:CredentialToken>' + token + '</svc:CredentialToken>' +
        '<svc:DisplaySettings><pub:CurrentPage>' + page + '</pub:CurrentPage><pub:PageSize>100</pub:PageSize></svc:DisplaySettings>' +
        '<svc:GetProgramsQuery>' +
        //'<pub:ProgramIds><arr:int>'+programId +'</arr:int></pub:ProgramIds>'+
        '<pub:PartnershipStatus>' +
        '<pub:ProgramPartnershipStatusEnum>Active</pub:ProgramPartnershipStatusEnum>' +
        //'<pub:ProgramPartnershipStatusEnum>Paused</pub:ProgramPartnershipStatusEnum>' +
        //'<pub:ProgramPartnershipStatusEnum>Waiting</pub:ProgramPartnershipStatusEnum>' +
        //'<pub:ProgramPartnershipStatusEnum>Cancelled</pub:ProgramPartnershipStatusEnum>' +
        '</pub:PartnershipStatus>' +
        '</svc:GetProgramsQuery>' +
        '</svc:GetProgramsRequest>' +
        '</soapenv:Body>' +
        '</soapenv:Envelope>';
};

let addToAllPrograms = function (items) {

    storage.get(['allProgramHosts', 'allPrograms'], function (results) {
        let allProgramHosts = '';
        let allPrograms = [];

        for (let i = 0; i < items.length; i++) {
            const url = items[i].getElementsByTagName("a:ProgramURL")[0].firstChild.nodeValue;
            let parsedHost = getHostNameForUrl(url);
            let screenshotUrl = "";

            if (items[i].getElementsByTagName("a:ScreenshotURL")[0].firstChild !== null) {
                screenshotUrl = items[i].getElementsByTagName("a:ScreenshotURL")[0].firstChild.nodeValue;

                if (screenshotUrl === null) {
                    screenshotUrl = ' ';
                }
                else {
                    // screenshot url is in format https://simple.thumbshots.com/image.aspx?cid=1515&v=1&w=240&h=140&url=https%3a%2f%2fwww%2E123moebel%2Ede
                    let parsedScreenshotUrl = getQueryParam('url', screenshotUrl);
                    if (parsedScreenshotUrl !== null) {
                        parsedScreenshotUrl = getHostNameForUrl(parsedScreenshotUrl);

                        if (parsedScreenshotUrl !== parsedHost && parsedScreenshotUrl !== null) {
                            parsedHost = parsedScreenshotUrl;
                        }
                    }
                }
            } else {
                console.debug('No ScreenshotURL detected for  ' + parsedHost);
                console.debug(items[i].getElementsByTagName("a:ScreenshotURL")[0].firstChild);
                console.debug(items[i]);
            }

            if (parsedHost !== 'affili.net' && parsedHost !== 'www.facebook.com') {
                const sendData = {
                    programId: items[i].getElementsByTagName("a:ProgramId")[0].firstChild.nodeValue,
                    title: items[i].getElementsByTagName("a:ProgramTitle")[0].firstChild.nodeValue,
                    url: url,
                    parsedHost: parsedHost,
                    screenshotUrl: screenshotUrl
                };

                allProgramHosts = allProgramHosts + ' ' + parsedHost;
                allPrograms.push(sendData)
            }
        }

        storage.get(['allProgramHosts', 'allPrograms'], function (results) {


            if (!results.allProgramHosts) {
                results.allProgramHosts = '';
            }

            if (!results.allPrograms) {
                results.allPrograms = [];
            }
            results.allProgramHosts += allProgramHosts;
            results.allPrograms = results.allPrograms.concat(allPrograms);

            storage.set(
                {
                    allProgramHosts: results.allProgramHosts,
                    allPrograms: results.allPrograms
                });
        })


    });


};


let addToMyPrograms = function (items) {

    storage.get("myPrograms", function (results) {
        let myPrograms = results["myPrograms"] || [];

        for (let i = 0; i < items.length; i++) {
            let url = items[i].getElementsByTagName("a:ProgramURL")[0].firstChild.nodeValue;
            let parsedHost = getHostNameForUrl(url);
            let screenshotUrl = "";
            if (items[i].getElementsByTagName("a:ScreenshotURL")[0].firstChild != null) {
                screenshotUrl = items[i].getElementsByTagName("a:ScreenshotURL")[0].firstChild.nodeValue;
                if (screenshotUrl === null) {
                    screenshotUrl = '';
                }
                else {
                    // screenshot url is in format https://simple.thumbshots.com/image.aspx?cid=1515&v=1&w=240&h=140&url=https%3a%2f%2fwww%2E123moebel%2Ede
                    screenshotUrl = getQueryParam('url', screenshotUrl);
                    if (screenshotUrl !== null) {
                        let parsedScreenshotUrl = getHostNameForUrl(screenshotUrl);
                        if (parsedScreenshotUrl !== parsedHost) {
                            parsedHost = parsedScreenshotUrl;
                        }
                    }
                }
            } else {
                console.debug('No ScreenshotURL detected for  ' + parsedHost);
                console.debug(items[i].getElementsByTagName("a:ScreenshotURL")[0].firstChild);
            }
            let newProgram = {
                programId: items[i].getElementsByTagName("a:ProgramId")[0].firstChild.nodeValue,
                title: items[i].getElementsByTagName("a:ProgramTitle")[0].firstChild.nodeValue,
                url: url,
                parsedHost: parsedHost,
                screenshotUrl: screenshotUrl
            };
            myPrograms.push(newProgram);

            storage.set({myPrograms: myPrograms});
        }
    })
};


let Logon = function () {
    console.log('in logon');
    return new Promise(function (resolve, reject) {
            const requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:typ="http://affilinet.framework.webservices/types">' +
                '<soapenv:Header/>' +
                '<soapenv:Body>' +
                '<svc:LogonRequestMsg>' +
                '<typ:Username>' + publisherId.trim() + '</typ:Username>' +
                '<typ:Password>' + webservicePassword.trim() + '</typ:Password>' +
                '<typ:WebServiceType>Publisher</typ:WebServiceType>' +
                '</svc:LogonRequestMsg>' +
                '</soapenv:Body>' +
                '</soapenv:Envelope>';
            _sendRequest(requestBody, 'https://api.affili.net/V2.0/Logon.svc', 'http://affilinet.framework.webservices/Svc/ServiceContract1/Logon').then(resolve, reject);
        }
    );
};


class PublisherWebservice {

    constructor() {
        console.log('created Publisher Webservice')
    }

    GetMyPrograms(resolve, errorCallback) {
        return new Promise(function (resolve, reject) {
            "use strict";
            getToken().then(
                function success(response) {
                    const requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc" xmlns:pub="http://affilinet.framework.webservices/types/PublisherProgram" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                        '<soapenv:Header/>' +
                        '<soapenv:Body>' +
                        '<svc:GetProgramsRequest>' +
                        '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                        '<svc:DisplaySettings><pub:CurrentPage>1</pub:CurrentPage><pub:PageSize>100</pub:PageSize></svc:DisplaySettings>' +
                        '<svc:GetProgramsQuery>' +
                        //'<pub:ProgramIds><arr:int>'+programId +'</arr:int></pub:ProgramIds>'+
                        '<pub:PartnershipStatus>' +
                        '<pub:ProgramPartnershipStatusEnum>Active</pub:ProgramPartnershipStatusEnum>' +
                        //'<pub:ProgramPartnershipStatusEnum>Paused</pub:ProgramPartnershipStatusEnum>' +
                        //'<pub:ProgramPartnershipStatusEnum>Waiting</pub:ProgramPartnershipStatusEnum>' +
                        //'<pub:ProgramPartnershipStatusEnum>Cancelled</pub:ProgramPartnershipStatusEnum>' +
                        '</pub:PartnershipStatus>' +
                        '</svc:GetProgramsQuery>' +
                        '</svc:GetProgramsRequest>' +
                        '</soapenv:Body>' +
                        '</soapenv:Envelope>';

                    _sendRequest(requestBody, 'https://api.affili.net/V2.0/PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms').then(resolve, reject);

                },
                function error(error) {
                    console.debug('Error in method GetMyPrograms:error', error);
                    reject(error)
                }
            );
        });
    }


    GetLinkedAccounts() {
        console.debug('in Method GetLinkedAccounts');
        return new Promise(function (resolve, reject) {
            "use strict";
            getToken().then(
                function success(response) {
                    console.debug('in Method GetLinkedAccounts:success');

                    const requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc">' +
                        '<soapenv:Header/>' +
                        '<soapenv:Body>' +
                        '<svc:GetLinkedAccountsRequest>' +
                        '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                        '<svc:PublisherId>' + publisherId + '</svc:PublisherId>' +
                        '</svc:GetLinkedAccountsRequest>' +
                        '</soapenv:Body>' +
                        '</soapenv:Envelope>';

                    console.debug('LinkedAccounts Request:');

                    _sendRequest(requestBody, 'http://api.affili.net/V2.0/AccountService.svc', 'http://affilinet.framework.webservices/Svc/AccountServiceContract/GetLinkedAccounts').then(resolve, reject);

                },
                function error() {
                    console.debug('in Method GetLinkedAccounts:error');
                    reject();
                }
            );
        });
    }

    GetPublisherSummary() {
        console.debug('in Method GetPublisherSummary');
        return new Promise(function (resolve, reject) {
            "use strict";
            getToken().then(
                function success(response) {
                    const requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc">' +
                        '<soapenv:Header/>' +
                        '<soapenv:Body>' +
                        '<svc:CredentialToken>' + response + '</svc:CredentialToken>' +
                        '</soapenv:Body>' +
                        '</soapenv:Envelope>';
                    _sendRequest(requestBody, 'http://api.affili.net/V2.0/AccountService.svc', 'http://affilinet.framework.webservices/Svc/AccountServiceContract/GetPublisherSummary').then(resolve, reject);

                },
                function error(error) {
                    console.debug('Error in Method GetPublisherSummary', error);
                    reject(error)
                }
            );
        });
    }


    UpdateAllPrograms() {

        storage.remove('allPrograms');
        storage.remove('allProgramHosts');

        // hole die ersten 100 ergebnisse

        console.debug('Downloading AllPrograms started');
        getToken().then(
            function success(token) {
                let page = 1;
                _sendRequest(generateBodyForAllPrograms(token, page), 'https://api.affili.net/V2.0/PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms').then(
                    function (response) {
                        // checke ob mehr als 100
                        const xmlDoc = getXml(response);
                        const totalResults = xmlDoc.getElementsByTagName("TotalResults")[0].firstChild.nodeValue;
                        const ProgramCollection = xmlDoc.getElementsByTagName("ProgramCollection")[0];
                        const resultsOnThisPage = ProgramCollection.getElementsByTagName("a:Program").length;

                        const totalPages = Math.ceil(totalResults / 100);
                        const items = ProgramCollection.getElementsByTagName("a:Program");
                        addToAllPrograms(items);

                        if (resultsOnThisPage === 100) {
                            for (let page = 1; page < totalPages; page++) {
                                _sendRequest(generateBodyForAllPrograms(token, page), 'https://api.affili.net/V2.0/PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms').then(function (response) {
                                    const xmlDoc = getXml(response);
                                    let ProgramCollection = xmlDoc.getElementsByTagName("ProgramCollection")[0];
                                    let items = ProgramCollection.getElementsByTagName("a:Program");
                                    addToAllPrograms(items);
                                }, console.debug);
                                console.debug('page number ' + page + ' of AllPrograms added');
                            }
                        }


                    }, console.debug);
            },
            function error(error) {
                console.debug('ERROR in Method GetAllPrograms', error);
            }
        );

        // wenn mehr als 100 iteriere bis maximale anzahl erreicht ist


    }


    UpdateMyPrograms() {

        storage.remove('myPrograms');

        // hole die ersten 100 ergebnisse

        getToken().then(
            function success(token) {
                let page = 1;
                _sendRequest(generateBodyForMyPrograms(token, page), 'https://api.affili.net/V2.0/PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms').then(
                    function (response) {
                        // checke ob mehr als 100
                        const xmlDoc = getXml(response);
                        const totalResults = xmlDoc.getElementsByTagName("TotalResults")[0].firstChild.nodeValue;
                        const ProgramCollection = xmlDoc.getElementsByTagName("ProgramCollection")[0];
                        const resultsOnThisPage = ProgramCollection.getElementsByTagName("a:Program").length;

                        const totalPages = Math.ceil(totalResults / 100);
                        const items = ProgramCollection.getElementsByTagName("a:Program");
                        addToMyPrograms(items);

                        if (resultsOnThisPage == 100) {
                            for (page; page < totalPages; page++) {
                                _sendRequest(generateBodyForMyPrograms(token, page), 'https://api.affili.net/V2.0/PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms').then(function (response) {
                                    const xmlDoc = getXml(response);
                                    const ProgramCollection = xmlDoc.getElementsByTagName("ProgramCollection")[0];
                                    const items = ProgramCollection.getElementsByTagName("a:Program");
                                    addToMyPrograms(items);
                                }, console.debug)
                            }
                        }

                        console.debug(page + 'SEITEN MyPrograms Hinzugefügt!!!');

                    }, console.debug);

            },
            function error() {
                console.debug('in Method GetAllPrograms:error');
            }
        );

        // wenn mehr als 100 iteriere bis maximale anzahl erreicht ist


    }


    Reset() {
        "use strict";
        _removeToken();
    }

    UpdateCredentials(pub, pass) {
        publisherId = pub;
        webservicePassword = pass;

    }
}

let publisherWebservice = new PublisherWebservice();
module.exports = publisherWebservice;



