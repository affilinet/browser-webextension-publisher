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

let myProgramsCache = [];

let token = false;
let validUntil = false;

function getXml(string) {
    let parser = new DOMParser();
    const document = parser.parseFromString(string, "application/xml");
    if (_hasParseError(document)) {
        console.error('XML PARSER ERROR: Could not parse Response from Webservice', document);
        console.error(string);
    }
    return document
}

/**
 * https://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
 * Note this might not work on IE
 * @param parsedDocument
 * @returns {boolean}
 * @private
 */
function _hasParseError(parsedDocument) {
    // parser and parsererrorNS could be cached on startup for efficiency
    let parser = new DOMParser(),
        errorneousParse = parser.parseFromString('<', 'text/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
        return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }
    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
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
    // Refresh token 2 minutes before it is invalid
    const now = (Math.floor(Date.now()) + 2 * 60 * 1000);
    console.log('token is  valid  for another ', (validUntil - now) / 1000, ' seconds');
    if (token === false) {
        console.log('token is not set');
        return true;
    }
    return validUntil === false || validUntil < now;

};

let getToken = function () {
    return new Promise(function (resolve, reject) {
        "use strict";
        if (_tokenMustBeRefreshed()) {
            console.log('token will get refreshed');
            Logon().then(
                function success(response) {
                    let xmlDoc = getXml(response);
                    let localToken = xmlDoc.getElementsByTagName('CredentialToken')[0].firstChild.nodeValue;
                    token = localToken;
                    _getTokenExpiration(token).then(
                        (tokenExpResult) => {
                            let xmlDoc = getXml(tokenExpResult);
                            let expirationDate = xmlDoc.getElementsByTagName('ExpirationDate')[0].firstChild.nodeValue;
                            validUntil = new Date(expirationDate).getTime();
                            resolve(localToken);
                        },
                        (error) => {
                            console.log('error in get token expiration ', error);
                            validUntil = 0;
                            reject(error);
                        }
                    );


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

let _getTokenExpiration = function (token) {
    console.log('in GetTokenExpiration');
    return new Promise(function (resolve, reject) {
            const requestBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://affilinet.framework.webservices/Svc">' +
                '   <soapenv:Header/>' +
                '   <soapenv:Body>' +
                '      <svc:CredentialToken>' + token + '</svc:CredentialToken>' +
                '   </soapenv:Body>' +
                '</soapenv:Envelope>';
            _sendRequest(requestBody, 'https://api.affili.net/V2.0/Logon.svc', 'http://affilinet.framework.webservices/Svc/AuthenticationContract/GetIdentifierExpiration').then(resolve, reject);
        }
    );
};
let _fetchAllMyProgramsPages = function (totalPages, token, startWith = 1) {
    _fetchOneOfMyProgramsPage(startWith, token).then(
        (response) => {
            const xmlDoc = getXml(response);
            const ProgramCollection = xmlDoc.getElementsByTagName("ProgramCollection")[0];
            const items = ProgramCollection.getElementsByTagName("a:Program");
            for (let i = 0; i < items.length; i++) {
                let newProgram = {
                    programId: items[i].getElementsByTagName("a:ProgramId")[0].firstChild.nodeValue,
                    programTitle: items[i].getElementsByTagName("a:ProgramTitle")[0].firstChild.nodeValue,
                };
                myProgramsCache.push(newProgram);
            }

            if (startWith < totalPages) {
                _fetchAllMyProgramsPages(totalPages, token, startWith + 1);
            } else {
                console.log('INFO: Webservice returned', myProgramsCache.length, ' Program Partnership');
                storage.set({myPrograms: myProgramsCache});
                console.debug('added page ' + myProgramsCache.length + ' Programs of myPrograms');
            }
        }
    )
}


let _fetchOneOfMyProgramsPage = function (page, token) {
    console.log('Send Request for page', page);
    return _sendRequest(generateBodyForMyPrograms(token, page), 'https://api.affili.net/V2.0/PublisherProgram.svc', 'http://affilinet.framework.webservices/Svc/PublisherProgramContract/SearchPrograms');
}

class PublisherWebservice {

    constructor() {
        console.log('created Publisher Webservice')
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


    UpdateMyPrograms() {

        storage.remove('myPrograms');
        myProgramsCache = [];

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

                        let totalPages = Math.ceil(totalResults / 100);
                        console.log('INFO: Webservice Reports ', totalResults, ' Partnerships on ', totalPages, ' Pages.. fetching data from webserivice');

                        _fetchAllMyProgramsPages(totalPages, token, 1);


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



