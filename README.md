## Installation
1. Clone the repository `git clone https://github.com/affilinet/browser-webextension-publisher.git`
2. Run `npm install`
3. Run `bower install`
4. Run `npm run build`

Alternately, if you want to try out the extension, here are the download links. After you download it, unzip the file and load it in your browser using the steps mentioned below.
 - [**Download Chrome Extension**](https://github.com/affilinet/browser-webextension-publisher/raw/master/dist/chrome.zip)
 - [**Download Firefox Extension**](https://github.com/affilinet/browser-webextension-publisher/raw/master/dist/firefox.zip)
 - [**Download Opera Extension**](https://github.com/affilinet/browser-webextension-publisher/raw/master/dist/opera.zip)


##### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose to `browser-webextension-publisher/build/chrome` or (`browser-webextension-publisher/build/opera`)


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `browser-webextension-publisher/build/firefox`


## Developing
The following tasks can be used when you want to start developing the extension and want to enable live reload - 

- `npm run chrome-watch`
- `npm run firefox-watch`
- `npm run opera-watch`


## Packaging
Run `npm run dist` to create a zipped, production-ready extension for each browser. You can then upload that to the appstore.


## Credits
Boilerplate by [bharani91](https://github.com/EmailThis/extension-boilerplate/)
