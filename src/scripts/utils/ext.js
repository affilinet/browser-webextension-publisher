const apis = [
  'alarms',
  'bookmarks',
  'browserAction',
  'commands',
  'contextMenus',
  'cookies',
  'downloads',
  'events',
  'extension',
  'extensionTypes',
  'history',
  'i18n',
  'idle',
  'notifications',
  'pageAction',
  'runtime',
  'storage',
  'tabs',
  'webNavigation',
  'webRequest',
  'windows',
]



function Extension () {
  const _this = this;

  apis.forEach(function (api) {

    _this[api] = null;


    try {
      if (chrome[api]) {
        _this[api] = chrome[api]
      }
    } catch (e) {}

    try {
      if (window[api]) {
        _this[api] = window[api]
      }
    } catch (e) {}

    try {
      if (browser[api]) {
        _this[api] = browser[api]
      }
    } catch (e) {}
    try {
      _this.api = browser.extension[api]
    } catch (e) {}
  });

  try {
    if (browser && browser.runtime) {
      this.runtime = browser.runtime
    }
  } catch (e) {}

  try {
    if (browser && browser.browserAction) {
      this.browserAction = browser.browserAction
    }
  } catch (e) {}

}


/**
 * @typedef {Object} FooEngine
 * @property {function(string, boolean)} start Starts the [Foo/Bar] Engine
 */

/**
 * The Browser Extensions
 * @typedef {Object} Extension
 * @proptery {function} alarms
 * @proptery {function} bookmarks
 * @proptery {function} browserAction
 * @proptery {function} commands
 * @proptery {function} contextMenus
 * @proptery {function} cookies
 * @proptery {function} downloads
 * @proptery {function} events
 * @proptery {function} extension
 * @proptery {function} extensionTypes
 * @proptery {function} history
 * @proptery {function} i18n
 * @proptery {function} idle
 * @proptery {function} notifications
 * @proptery {function} pageAction
 * @proptery {function} runtime
 * @proptery {function} storage
 * @proptery {function} tabs
 * @proptery {function} webNavigation
 * @proptery {function} webRequest
 * @proptery {function} windows
 */

let ext = new Extension();

module.exports = ext;