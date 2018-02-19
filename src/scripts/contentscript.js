import ext from "./utils/ext";
import storage from "./utils/storage";

/**
 * Content Script ist loaded into ALL TABS
 *
 */




function initContextMenu() {
    let contextMenuIsOpened = false;
    let currentImage = null;

    let successMessageTimeout = null;
    let hoverImageContainer = createHoverImageContainer();
    let contextMenu = createContextMenu();
    let currentPageHasProgramPartnershipAndDeeplink = false;

    hoverImageContainer.appendChild(contextMenu);
    hoverImageContainer.addEventListener('click', openContextMenu);

    contextMenu.addEventListener('click', onContextMenuClick);

    // close context menu on escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeContextMenu();
        }
    });

    // listener for messages from backgroundpage

    ext.runtime.sendMessage({  action: "hasProgramPartnershipAndDeeplink"}, function(response){
        hasProgramPartnershipAndDeeplink(response);

    });

    function hasProgramPartnershipAndDeeplink(value) {
        currentPageHasProgramPartnershipAndDeeplink = value;
        if (value === true) {
            document.getElementById('affilinet-webext-copy-codes-headline').classList.remove('affilinet-webext-hidden');
            document.getElementById('affilinet-webext-copy-codes').classList.remove('affilinet-webext-hidden');
        } else {
            document.getElementById('affilinet-webext-copy-codes-headline').classList.add('affilinet-webext-hidden');
            document.getElementById('affilinet-webext-copy-codes').classList.add('affilinet-webext-hidden');
        }
    }


    function createHoverImageContainer() {
        let iconURL = ext.extension.getURL('icons/icon-16.png');
        let hoverImageContainer = document.createElement('div');
        hoverImageContainer.id = 'affilinet-webext-imageHoverBtn';
        let img = document.createElement('img');
        img.id = 'affilinet-webext-image';
        img.src = iconURL;
        hoverImageContainer.appendChild(img);
        return hoverImageContainer;
    }

    function createContextMenu() {
        let contextmenu = document.createElement('div');
        contextmenu.id = 'affilinet-webext-contextmenu';

        /**
         * No unsafe strings are passed to innerHTML
         */
        contextmenu.innerHTML = '<div class="affilinet-webext-row" style="margin-bottom:0 !important;"><img id="affilinet-webext-close" data-target="close" src="' + ext.extension.getURL('images/fa-close.gif') + '"></div>' +
            '' +
            '<div class="affilinet-webext-row"> <p>' + ext.i18n.getMessage('context_shareOn') + '</p></div>' +
            '<div class="affilinet-webext-row">' +
            '<img class="affilinet-webext-share" data-target="pinterest" src="' + ext.extension.getURL('images/fa-pinterest.gif') + '">' +
            '<img class="affilinet-webext-share" data-target="facebook" src="' + ext.extension.getURL('images/fa-facebook.gif') + '">' +
            '<img class="affilinet-webext-share" data-target="google" src="' + ext.extension.getURL('images/fa-google.gif') + '">' +
            '<img class="affilinet-webext-share" data-target="twitter" src="' + ext.extension.getURL('images/fa-twitter-square.gif') + '">' +
            '</div>' +
            '<div class="affilinet-webext-row"> <p>' + ext.i18n.getMessage('context_likeList') + '</p></div>' +
            '<div class="affilinet-webext-row">' +
            '<img class="affilinet-webext-save" data-target="image" src="' + ext.extension.getURL('images/fa-camera.gif') + '">' +
            '<img class="affilinet-webext-save" data-target="link" src="' + ext.extension.getURL('images/fa-globe.gif') + '">' +
            '</div>' +
            '<div class="affilinet-webext-row affilinet-webext-hidden" id="affilinet-webext-copy-codes-headline"> <p>' + ext.i18n.getMessage('context_codes') + '</p></div>' +
            '<div class="affilinet-webext-row affilinet-webext-hidden" id="affilinet-webext-copy-codes">' +
            '<img class="affilinet-webext-code" data-target="copyImageCode" src="' + ext.extension.getURL('images/fa-code.gif') + '">' +
            '<img class="affilinet-webext-deeplink" data-target="copyDeeplink" src="' + ext.extension.getURL('images/fa-link.gif') + '">' +
            '</div>' +
            '<div class="affilinet-webext-row">' +
            '<div id="affilinet-webext-success-message" class="affilinet-webext-hidden"></div>' +
            '</div>';
        return contextmenu;
    }


    function openContextMenu(event) {
        event.stopPropagation();
        event.preventDefault();
        contextMenu.style.display = 'block';
        document.addEventListener('click', closeContextMenu);
        contextMenuIsOpened = true;
    }


    function onContextMenuClick(event) {
        event.stopPropagation();
        event.preventDefault();
        if (event.target.dataset.target) {
            switch (event.target.dataset.target) {
                case 'close' :
                    closeContextMenu();
                    break;
                case 'image' :
                    saveImage();
                    break;
                case 'link' :
                    saveLink();
                    break;
                case 'copyDeeplink' :
                    copyDeeplink();
                    break;
                case 'copyImageCode' :
                    copyImageCode();
                    break;
                case  'pinterest' :
                case  'facebook' :
                case  'google' :
                case  'twitter' :
                    shareOn(event.target.dataset.target);
                    break;
            }
        }
        return false;
    }

    function copyDeeplink() {
        console.log('copy deeplink');

        ext.runtime.sendMessage({
            action: "copyDeeplink",
            data: getShareDetails()
        }, function(response){
            showSuccessMessage(response, ext.i18n.getMessage('context_messageDeeplinkCopied') )
        });
    }
    function copyImageCode() {
        console.log('copy image code');
        ext.runtime.sendMessage({
            action: "copyImageCode",
            data: getShareDetails()
        }, function(response){
            showSuccessMessage(response, ext.i18n.getMessage('context_messageImageCodeCopied') )
        });
    }

    function closeContextMenu() {
        if (contextMenuIsOpened) {
            contextMenu.style.display = 'none';
            contextMenuIsOpened = false;
            document.removeEventListener('click', closeContextMenu);
            document.getElementById('affilinet-webext-success-message').innerText = '';
            document.getElementById('affilinet-webext-success-message').classList.add('affilinet-webext-hidden');

        }

    }

    function shareOn(socialNetworkName) {
        ext.runtime
            .sendMessage({
                action: "share-on-" + socialNetworkName,
                data: getShareDetails()
            });
        closeContextMenu();

    }

    function saveImage() {
        let details = getShareDetails();
        details.type = 'image';
        ext.runtime.sendMessage({
            action: "save-in-like-list",
            data: details
        }, function(response){
            showSuccessMessage(response, ext.i18n.getMessage('context_messageImageSaved') )
        });
    }

    function saveLink() {
        let details = getShareDetails();
        details.type = 'link';
        ext.runtime.sendMessage({
            action: "save-in-like-list",
            data: details
        }, function(response){
            showSuccessMessage(response, ext.i18n.getMessage('context_messageWebsiteSaved'))
        });
    }

    function showSuccessMessage(response, message) {
        console.log('RESPONSE', response);
        document.getElementById('affilinet-webext-success-message').innerText = message
        document.getElementById('affilinet-webext-success-message').classList.remove('affilinet-webext-hidden');

    }
    function getShareDetails() {
        return {
            image: {
                src: currentImage.src,
                width: currentImage.width,
                height: currentImage.height,
                alt: currentImage.alt,
                title: currentImage.title,
            },
            uri: window.location.toString(),
            hasDeeplink : currentPageHasProgramPartnershipAndDeeplink ,
            pageTitle: document.title,
            createdAt: +new Date()
        };
    }

    function positionHoverImage(boundingEdges) {
        let top = boundingEdges.top + boundingEdges.height + window.pageYOffset - 26;
        let left = boundingEdges.left + boundingEdges.width + window.pageXOffset - 26;
        hoverImageContainer.style.top = top + 'px';
        hoverImageContainer.style.left = left + 'px';
    }

    function showHoverImage() {
        hoverImageContainer.style.display = 'block';
    }

    function hideHoverImage() {
        hoverImageContainer.style.display = 'none';
    }

    function onImageMouseEnter() {
        if (contextMenuIsOpened) {
            return;
        }
        currentImage = this;
        positionHoverImage(this.getBoundingClientRect());
        showHoverImage();
    }

    function onImageMouseLeave(event) {
        if ((event.toElement && event.toElement.id.search('affilinet-webext') === 0 ) || contextMenuIsOpened) {
            return true;
        } else {
            hideHoverImage();
        }
    }


    function addListenersToAllImages() {
        let images = document.images;
        for (let i = 0; i < images.length; i++) {
            // only add listener to images wider or taller than 50 px
            if (images[i].width > 50 && images[i].height > 50) {
                images[i].addEventListener('mouseenter', onImageMouseEnter);
                images[i].addEventListener('mouseleave', onImageMouseLeave);
            }
        }
    }

    addListenersToAllImages();
    document.body.appendChild(hoverImageContainer);
    // images.addEventListener('change' , console.info('changed images'));


    let target = document.body;

    // create an observer instance
    let observer = new MutationObserver(function (mutations) {
        addListenersToAllImages();
    });

    // configuration of the observer , only when nodes are added
    let config = {attributes: false, childList: true, characterData: false};

    // pass in the target node, as well as the observer options
    observer.observe(target, config);

}


function detectWordpressPluginAdminPage() {
    if (window.location.toString().indexOf('wp-admin') > -1) {

        // open widgets page when clicking on the button
        let buttons = document.getElementsByClassName('affilinet-browser-extension-open-widgets-page-on-click');

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function() {
                ext.runtime.sendMessage({action: "open-page", data: {page: "widget"}});
            });
        }


        // unhide elements to simulate 'detection of browser extension'
        let elems = document.getElementsByClassName('affilinet-browser-extension-show');
        for (let i = 0; i < elems.length; i++) {
            elems[i].style.display = 'block';
        }
    }

}

(function () {
    storage.get('disableImageContextMenu', (result) => {
        if (result.disableImageContextMenu !== true) {
            initContextMenu();
        }
    });
    // detect Wordpress plugin settings page
    detectWordpressPluginAdminPage();



})();

