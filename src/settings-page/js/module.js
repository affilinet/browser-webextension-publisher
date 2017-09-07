angular.module('AffilinetToolbar', [
    'ui.bootstrap',
    'ui.bootstrap.popover',
    'ui.router',
    'angular-momentjs',
    'xml',
    'template',
    'angular-flot',
    'angular-clipboard',
    'pascalprecht.translate',
    'oi.select',
    'mgcrea.bootstrap.affix',
    'xeditable',
    'ngDragDrop',
    'slickCarousel',
    'rzModule'
], function ($compileProvider) {
    "use strict";
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|resource):/);

}).config(function ($httpProvider, $sceDelegateProvider, $translateProvider) {

    $httpProvider.interceptors.push('xmlHttpInterceptor');
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self'
    ]);

    $translateProvider.fallbackLanguage('en');

    $translateProvider.translations('en', {
        SIDEBAR_Account : "Account",
        SIDEBAR_Tools : "Tools",

        LOCALE_DATEFORMAT: 'MM/DD/YYYY',
        ORDERS_PageName: 'Statistics',
        ORDERS_ChartLabelConfCommission: 'Confirmed Commission',
        ORDERS_ChartLabelTotalSales: 'Total Sales',
        ORDERS_SHOW_STATISTICS: 'Show statistics',
        ORDERS_BY_DAY: 'By day',
        ORDERS_BY_PROGRAM: 'By Program',
        ORDERS_ProgramName: 'Program Name',
        ORDERS_Date: 'Date',
        ORDERS_Views: 'Views',
        ORDERS_Clicks: 'Clicks',
        ORDERS_Open: 'Open',
        ORDERS_Confirmed: 'Confirmed',
        ORDERS_Cancelled: 'Cancelled',
        ORDERS_Sales_Leads: 'Sales/Leads',
        ORDERS_Commission: 'Commission',
        ORDERS_MoreStatistics: 'More Statistics',

        NEWS_PageName: 'New Programs',
        NEWS_NewPrograms: 'New Programs',
        NEWS_NewVouchers: 'New Vouchers',
        NEWS_Image: 'Image',
        NEWS_ProgramName: 'Program Name',
        NEWS_Apply: 'Apply',
        NEWS_VoucherName: 'Voucher Name',
        NEWS_ApplyNow: 'Apply Now',

        SETTINGS_PageName: 'Settings',
        SETTINGS_LoginData: 'Login Data',
        SETTINGS_PublisherId: 'Publisher ID',
        SETTINGS_WebservicePassword: 'Publisher Webservice Password',
        SETTINGS_productWebservicePassword: 'Product Webservice Password',
        SETTINGS_disableImageContextMenu: 'Disable the image context menu',
        SETTINGS_save: 'Save',
        SETTINGS_about: 'Help',
        SETTINGS_findYouPassLinkText: 'Find your Webservice Passwords',
        SETTINGS_CountryPlatform: 'affilinet Country Platform',
        SETTINGS_CountryPlatformDE: 'affilinet Germany',
        SETTINGS_CountryPlatformEN: 'affilinet England',
        SETTINGS_CountryPlatformFR: 'affilinet France',
        SETTINGS_CountryPlatformCH: 'affilinet Switzerland',
        SETTINGS_CountryPlatformAT: 'affilinet Austria',
        SETTINGS_CountryPlatformES: 'affilinet Spain',
        SETTINGS_CountryPlatformNL: 'affilinet Benelux',

        APPLY_PageName: 'Apply Now',
        APPLY_ProgramDesc: 'Program Description',
        APPLY_ProgramLimits: 'Program Limitations',
        APPLY_LinkToSite: 'Link to Website',
        APPLY_ProgramStartStatus: 'Program Start/Status',
        APPLY_PartnerShipStatus: 'Partnership Status',
        APPLY_ApplyNow: 'To application page',
        Active: 'Active',
        Paused: 'Paused',
        Waiting: 'Waiting',
        Refused: 'Refused',
        Cancelled: 'Cancelled',
        NoPartnership: 'No Partnership',


        GETCREATIVES_PageName: 'Get Creatives',
        GETCREATIVES_SelectSize: 'Select Size',
        GETCREATIVES_CopyCode: 'Copy AdCode',
        GETCREATIVES_preview: 'Preview Ad',

        GETVOUCHERS_PageName: 'Get Vouchers',
        GETVOUCHERS_ProgramName: 'Program Name',
        GETVOUCHERS_VoucherName: 'Voucher Name',
        GETVOUCHERS_Properties: 'Properties',
        GETVOUCHERS_Code: 'Code',
        GETVOUCHERS_ApplyNowCopyCode: 'Apply/Copy Code',
        GETVOUCHERS_AllCustomers: 'All Customers',
        GETVOUCHERS_MinimumOrderValue: 'Minimum Order Value',

        SpecificProducts: 'Specific Products',
        AllProducts: 'All Products',
        FreeProduct: 'Free Product',

        GETVOUCHERS_ApplyNow: 'Apply Now',
        GETVOUCHERS_CopyVoucherCode: 'Copy Voucher Code',
        IMPRESSUM_LINK: 'https://www.affili.net/uk/about-affilinet/contact',

        SEARCHDISCOVER_PageName : 'Search & Discover',
        SEARCHDISCOVER_PlaceholderSearch : 'Products, Brands...',
        SEARCHDISCOVER_SearchFieldLabel : 'Keyword',
        SEARCHDISCOVER_LabelShops : 'Product Feeds',
        SEARCHDISCOVER_PlaceholderShops : 'Product Feeds',
        SEARCHDISCOVER_ResetButton: 'Reset',
        SEARCHDISCOVER_SearchButton : 'Search',
        SEARCHDISCOVER_AllPrograms : 'All Programs',
        SEARCHDISCOVER_LabelAllPrograms : 'Advertisers',
        SEARCHDISCOVER_AllCategories : 'All Categories',
        SEARCHDISCOVER_CreateWidgetHeadline : 'Add Products to Widget',
        SEARCHDISCOVER_BtnAddToWidget : 'Add to Widget',
        SEARCHDISCOVER_ShopCategories : 'Categories',
        SEARCHDISCOVER_PlaceholderShopCategories : 'Select Categories',
        SEARCHDISCOVER_PriceLabel: 'Price',
        SEARCHDISCOVER_SelectLikeListCategory : 'Select Category',
        SEARCHDISCOVER_StoreInLikeList : 'Store in my Like List',
        SEARCHDISCOVER_HeadlineSelectedProducts: 'Selected Products',
        SEARCHDISCOVER_SelectProductListLabel: 'Add to Product Like List',
        SEARCHDISCOVER_SelectProductListPlaceholder: 'Select or add List',
        SEARCHDISCOVER_AddToList: 'Add to List',
        SEARCHDISCOVER_NoProductsSelected: 'No products selected',
        SEARCHDISCOVER_LoadMoreBtn: 'Show more...',
        SEARCHDISCOVER_Results: 'Results',
        SEARCHDISCOVER_GoToProductList: 'Show List ',
        SEARCHDISCOVER_ProductsAddedToProductList: 'Products added to List',
        SEARCHDISCOVER_DisplayName : 'Product Name',
        SEARCHDISCOVER_DisplayBrand : 'Brand',
        SEARCHDISCOVER_DisplayPrice : 'Price',
        SEARCHDISCOVER_DisplayManufacturer : 'Manufacturer',

        LIKELIST_PageName : 'Like List',
        LIKELIST_TabProducts : 'Products',
        LIKELIST_TabPins : 'Images / Websites',
        LIKELIST_BtnCreateWidget : 'Create Widget from selected products',
        LIKELIST_ListNamesMustBeUnique: 'Product List names must be unique',
        LIKELIST_SureYouWantToDeleteProduct : 'Do you really want to delete this product',
        LIKELIST_NoProductsInList: 'No products yet in this list',
        LIKELIST_NoProductsInListBtnToSearchDiscover: 'Find products',
        LIKELIST_ProductNotAvailableAnymore: 'Sold out',
        LIKELIST_CreateNewProductList: 'New List',
        LIKELIST_PopoverShareOn: 'Share on:',
        LIKELIST_PopoverGetWidgetCode: 'Get Widget / Image Code / Deeplink',
        LIKELIST_PopoverMoveToList: 'Move to list:',
        LIKELIST_PopoverSelectProductListPlaceholder: 'Select List',
        LIKELIST_HeadlineImages : 'Image Pins',
        LIKELIST_NoLikesInImageList : 'No Images pinned.',
        LIKELIST_NoLikesInSiteList : 'No Websites pinned',
        LIKELIST_SureYouWantToDeleteLike: 'Do you really want to delete this pin',
        LIKELIST_PopoverVisitWebsite : 'Visit Website',
        LIKELIST_PopoverVisitWebsiteViewImage : 'Visit Website / View Image',
        LIKELIST_HeadlineSites : 'Website Pins',
        LIKELIST_SureYouWantToDeleteProductList: 'Are you sure you want to delete this Product List? This action can not be undone.',
        LIKELIST_PopoverCopyImageCodeDeeplink : 'Get Image Code/ Deeplink',



        WIDGET_PageName : 'Widget Generator',
        WIDGET_WizardHeadline : 'Settings',
        WIDGET_ProductsHeadline: 'Drag & Drop Products',
        WIDGET_PreviewHeadline: 'Widget Preview',
        WIDGET_GetCodeHeadline: 'Widget Code',
        WIDGET_SelectProductListPlaceholder: 'Product List',
        WIDGET_CopyToClipboard: 'Copy to Clipboard',
        WIDGET_GeneratorLabelWidth: 'Width',
        WIDGET_GeneratorLabelHeight: 'Height',
        WIDGET_GeneratorLabelType: 'Type',
        WIDGET_GeneratorLabelProductInfo: 'Product Info',
        WIDGET_GeneratorLabelImgSize: 'Image Size',
        WIDGET_GeneratorLabelPinIt: 'Pin-it',
        WIDGET_GeneratorLabelAutoplay: 'Auto Play',
        WIDGET_GeneratorLabelPrice: 'Price',
        WIDGET_GeneratorLabelName: 'Name',
        WIDGET_GeneratorLabelShop: 'Shop',
        WIDGET_GeneratorLabelBrand: 'Brand',
        WIDGET_GeneratorLabelManufacturer: 'Manufacturer',
        WIDGET_BtnCopyWidget: 'Copy Widget',
        WIDGET_BtnCreateNew: 'Create New Widget',
        WIDGET_BtnOpenWidget: 'Open Saved Widget',
        WIDGET_OpenWidgetPlaceholder: 'Select Widget',
        WIDGET_WidgetNameLabel: 'Widget Name',
        WIDGET_BtnSave: 'Save',
        WIDGET_DropProductHere: 'No Product added',
        WIDGET_SureYouWantToClearProductsFromWidget: 'Do you want to remove all products from your widget?',
        WIDGET_SureYouWantToDeleteWidget: 'Do you really want to delete this widget?',
        WIDGET_BtnDeleteWidget: 'Delete Widget',
        WIDGET_WarningChangesNotSaved: 'You have unsaved changes, do you really want to create a new Widget',

    });

    $translateProvider.translations('de', {

        SIDEBAR_Account : "Account",
        SIDEBAR_Tools : "Tools",

        LOCALE_DATEFORMAT: 'DD.MM.YYYY',
        ORDERS_PageName: 'Statistik',
        ORDERS_ChartLabelConfCommission: 'Bestätigte Provision',
        ORDERS_ChartLabelTotalSales: 'Gesamte Sales',
        ORDERS_SHOW_STATISTICS: 'Zeige Statistik',
        ORDERS_BY_DAY: 'Nach Tag',
        ORDERS_BY_PROGRAM: 'Nach Programm',
        ORDERS_ProgramName: 'Programm Name',
        ORDERS_Date: 'Datum',
        ORDERS_Views: 'Views',
        ORDERS_Clicks: 'Klicks',
        ORDERS_Open: 'Offene',
        ORDERS_Confirmed: 'Bestätigte',
        ORDERS_Cancelled: 'Stornierte',
        ORDERS_Sales_Leads: 'Sales/Leads',
        ORDERS_Commission: 'Provision',
        ORDERS_MoreStatistics: 'Mehr Statistiken',
        NEWS_PageName: 'Neue Programme',
        NEWS_NewPrograms: 'Neue Programme',
        NEWS_NewVouchers: 'Neue Gutscheine',
        NEWS_Image: 'Bild',
        NEWS_ProgramName: 'Programm Name',
        NEWS_Apply: 'Bewerben',
        NEWS_VoucherName: 'Gutschein Name',
        NEWS_ApplyNow: 'Jetzt bewerben',
        SETTINGS_PageName: 'Einstellungen',
        SETTINGS_LoginData: 'Login Daten',
        SETTINGS_PublisherId: 'Publisher ID',
        SETTINGS_WebservicePassword: 'Publisher Webservice Passwort',
        SETTINGS_disableImageContextMenu: 'Das Kontextmenu  nicht verwenden',
        SETTINGS_save: 'Speichern',
        SETTINGS_about: 'Hilfe',
        SETTINGS_findYouPassLinkText: 'Hier finden Sie Ihre Webservice Passwörter',

        SETTINGS_CountryPlatform: 'affilinet Länder Platform',
        SETTINGS_CountryPlatformDE: 'affilinet Deutschland',
        SETTINGS_CountryPlatformEN: 'affilinet England',
        SETTINGS_CountryPlatformFR: 'affilinet Frankreich',
        SETTINGS_CountryPlatformCH: 'affilinet Schweiz',
        SETTINGS_CountryPlatformAT: 'affilinet Österreich',
        SETTINGS_CountryPlatformES: 'affilinet Spanien',
        SETTINGS_CountryPlatformNL: 'affilinet Benelux',


        APPLY_PageName: 'Jetzt bewerben',
        APPLY_ProgramDesc: 'Programm Beschreibung',
        APPLY_ProgramLimits: 'Program Beschränkungen',
        APPLY_LinkToSite: 'Link zur Website',
        APPLY_ProgramStartStatus: 'Programm Start/Status',
        APPLY_PartnerShipStatus: 'Partnerschafts Status',
        APPLY_ApplyNow: 'Zur Anmeldung',
        Active: 'Aktiv',
        Paused: 'Pausiert',
        Waiting: 'Auf Bestätigung warten',
        Refused: 'Abgelehnt',
        Cancelled: 'Beendet',
        NoPartnership: 'Keine Partnerschaft',
        GETCREATIVES_PageName: 'Werbemittel',
        GETCREATIVES_SelectSize: 'Größe wählen',
        GETCREATIVES_CopyCode: 'AdCode kopieren',
        GETCREATIVES_preview: 'Vorschau',
        GETVOUCHERS_PageName: 'Gutscheine',
        GETVOUCHERS_ProgramName: 'Programm Name',
        GETVOUCHERS_VoucherName: 'Gutschein Name',
        GETVOUCHERS_Properties: 'Eigenschaften',
        GETVOUCHERS_Code: 'Code',
        GETVOUCHERS_ApplyNowCopyCode: 'Bewerben/Code kopieren',
        GETVOUCHERS_AllCustomers: 'Alle Kunden',
        GETVOUCHERS_MinimumOrderValue: 'Mindestbestellwert',
        SpecificProducts: 'Nur bestimmte Produkte',
        AllProducts: 'Alle Produkte',
        FreeProduct: 'Kostenloses Produkt',
        GETVOUCHERS_ApplyNow: 'Jetzt bewerben',
        GETVOUCHERS_CopyVoucherCode: 'Gutschein Code kopieren',

        IMPRESSUM_LINK: 'https://www.affili.net/de/footeritem/impressum',



    });

    $translateProvider.translations('fr', {

        SIDEBAR_Account : "Account",
        SIDEBAR_Tools : "Tools",


        LOCALE_DATEFORMAT: 'DD.MM.YYYY',
        ORDERS_PageName: 'Statistiques',
        ORDERS_ChartLabelConfCommission: 'Gains confirmés',
        ORDERS_ChartLabelTotalSales: 'Nb total de ventes',
        ORDERS_SHOW_STATISTICS: 'Afficher les statistiques',
        ORDERS_BY_DAY: 'Par jour',
        ORDERS_BY_PROGRAM: 'Par programme',
        ORDERS_ProgramName: 'Nom du programme',
        ORDERS_Date: 'Date',
        ORDERS_Views: 'Affichages',
        ORDERS_Clicks: 'Clics',
        ORDERS_Open: 'En attente',
        ORDERS_Confirmed: 'Confirmé',
        ORDERS_Cancelled: 'Annulé',
        ORDERS_Sales_Leads: 'Ventes/Leads',
        ORDERS_Commission: 'Commission',
        ORDERS_MoreStatistics: 'Plus de statistiques',
        NEWS_PageName: 'Actualités',
        NEWS_NewPrograms: 'Nouveaux programmes',
        NEWS_NewVouchers: 'Nouveaux codes promo',
        NEWS_Image: 'Image',
        NEWS_ProgramName: 'Nom du programme',
        NEWS_Apply: 'Postuler',
        NEWS_VoucherName: 'Nom du code',
        NEWS_ApplyNow: 'Je m\'inscris',
        SETTINGS_PageName: 'Paramètres',
        SETTINGS_LoginData: 'Identifiants',
        SETTINGS_PublisherId: 'ID affilié',
        SETTINGS_WebservicePassword: 'Mot de passe Webservice',
        SETTINGS_save: 'Sauvegarder',
        SETTINGS_about: 'Aide',
        SETTINGS_findYouPassLinkText: 'Trouver mon mot de passe Webservice', // todo pluralize

        SETTINGS_CountryPlatform: 'Plate-forme affilinet',
        SETTINGS_CountryPlatformDE: 'affilinet Allemagne',
        SETTINGS_CountryPlatformEN: 'affilinet Royaume-Uni',
        SETTINGS_CountryPlatformFR: 'affilinet France',
        SETTINGS_CountryPlatformCH: 'affilinet Suisse',
        SETTINGS_CountryPlatformAT: 'affilinet Autriche',
        SETTINGS_CountryPlatformES: 'affilinet Espagne',
        SETTINGS_CountryPlatformNL: 'affilinet Benelux',

        APPLY_PageName: 'Je m\'inscris',
        APPLY_ProgramDesc: 'Descriptif du programme',
        APPLY_ProgramLimits: 'Restrictions du programme',
        APPLY_LinkToSite: 'Voir le site',
        APPLY_ProgramStartStatus: 'Date de lancement / Statut',
        APPLY_PartnerShipStatus: 'Statut du partenariat',
        APPLY_ApplyNow: 'Je m\'inscris',
        Active: 'Actif',
        Paused: 'En pause',
        Waiting: 'En attente',
        Refused: 'Refusé',
        Cancelled: 'Annulé',
        NoPartnership: 'Aucun partenariat',
        GETCREATIVES_PageName: 'Visuels',
        GETCREATIVES_SelectSize: 'Sélectionner le format',
        GETCREATIVES_CopyCode: 'Copier le code',
        GETCREATIVES_preview: 'Vue l\'annonce',
        GETVOUCHERS_PageName: 'Codes promo',
        GETVOUCHERS_ProgramName: 'Nom du programme',
        GETVOUCHERS_VoucherName: 'Nom du code promo',
        GETVOUCHERS_Properties: 'Caractéristiques',
        GETVOUCHERS_Code: 'Code',
        GETVOUCHERS_ApplyNowCopyCode: 'S\'inscrire/Copier le code',
        GETVOUCHERS_AllCustomers: 'Tous les clients',
        GETVOUCHERS_MinimumOrderValue: 'Montant minimum d\'achat',
        SpecificProducts: 'Produits spécifiques',
        AllProducts: 'Tous les produits',
        FreeProduct: 'Produit offert',
        GETVOUCHERS_ApplyNow: 'Je m\'inscris',
        GETVOUCHERS_CopyVoucherCode: 'Copier le code',



    });


    $translateProvider.translations('es', {

        SIDEBAR_Account : "Account",
        SIDEBAR_Tools : "Tools",
        LOCALE_DATEFORMAT: 'DD.MM.YYYY',
        ORDERS_PageName: 'Estadística',
        ORDERS_ChartLabelConfCommission: 'Comisión confirmada',
        ORDERS_ChartLabelTotalSales: 'Ventas totales',
        ORDERS_SHOW_STATISTICS: 'Mostrar estadísticas',
        ORDERS_BY_DAY: 'Por día',
        ORDERS_BY_PROGRAM: 'Por Programa',
        ORDERS_ProgramName: 'Nombre del Programa',
        ORDERS_Date: 'Fecha',
        ORDERS_Views: 'Impresiones',
        ORDERS_Clicks: 'Clics',
        ORDERS_Open: 'Abierto',
        ORDERS_Confirmed: 'Confirmado',
        ORDERS_Cancelled: 'Cancelado',
        ORDERS_Sales_Leads: 'Ventas/Registros',
        ORDERS_Commission: 'Comisión',
        ORDERS_MoreStatistics: 'Más estadísticas',
        NEWS_PageName: 'Novedades',
        NEWS_NewPrograms: 'Nuevos Programas',
        NEWS_NewVouchers: 'Nuevos Vouchers',
        NEWS_Image: 'Imagen',
        NEWS_ProgramName: 'Nombre de Programa',
        NEWS_Apply: 'Solicitar',
        NEWS_VoucherName: 'Nombre del Voucher',
        NEWS_ApplyNow: 'Solicitar Ahora',
        SETTINGS_PageName: 'Ajustes',
        SETTINGS_LoginData: 'Datos de Login',
        SETTINGS_PublisherId: 'ID de publisher',
        SETTINGS_WebservicePassword: 'Contraseña de Webservice',
        SETTINGS_save: 'Guardar',
        SETTINGS_about: 'Ayuda',
        SETTINGS_findYouPassLinkText: 'Encontrar tu Contraseña de WebServices', // todo plularlize

        SETTINGS_CountryPlatform: 'affilinet Country Platform',
        SETTINGS_CountryPlatformDE: 'affilinet Alemania',
        SETTINGS_CountryPlatformEN: 'affilinet Inglaterra',
        SETTINGS_CountryPlatformFR: 'affilinet Francia',
        SETTINGS_CountryPlatformCH: 'affilinet Suiza',
        SETTINGS_CountryPlatformAT: 'affilinet Austria',
        SETTINGS_CountryPlatformES: 'affilinet España',
        SETTINGS_CountryPlatformNL: 'affilinet Benelux',

        APPLY_PageName: 'Solicitar Ahora',
        APPLY_ProgramDesc: 'Descripción de Programa',
        APPLY_ProgramLimits: 'Limitaciones de Programa',
        APPLY_LinkToSite: 'Enlace al sitio web',
        APPLY_ProgramStartStatus: 'Comienzo/Estado de Programa',
        APPLY_PartnerShipStatus: 'Estado de Partnership',
        APPLY_ApplyNow: 'Solicitar Ahora',
        Active: 'Activo',
        Paused: 'Pausado',
        Waiting: 'Esperando',
        Refused: 'Rechazado',
        Cancelled: 'Cancelado',
        NoPartnership: 'Sin Partnership',
        GETCREATIVES_PageName: 'Conseguir Creatividades',
        GETCREATIVES_SelectSize: 'Seleccionar Tamaño',
        GETCREATIVES_CopyCode: 'Copiar Código del Anuncio',
        GETCREATIVES_preview: 'Ver Anuncio',
        GETVOUCHERS_PageName: 'Conseguir Vouchers',
        GETVOUCHERS_ProgramName: 'Nombre del Programa',
        GETVOUCHERS_VoucherName: 'Nombre del Voucher',
        GETVOUCHERS_Properties: 'Propiedades',
        GETVOUCHERS_Code: 'Código',
        GETVOUCHERS_ApplyNowCopyCode: 'SolicitarCopiar Código',
        GETVOUCHERS_AllCustomers: 'Todos los clientes',
        GETVOUCHERS_MinimumOrderValue: 'Valor de orden mínimo',
        SpecificProducts: 'Productos Específicos',
        AllProducts: 'todos los Productos',
        FreeProduct: 'Productos Gratuitos',
        GETVOUCHERS_ApplyNow: 'Solicitar Ahora',
        GETVOUCHERS_CopyVoucherCode: 'Copiar Código Voucher',

        IMPRESSUM_LINK: 'https://www.affili.net/es/footeritem/aviso-legal',


    });


    $translateProvider.translations('nl', {

        SIDEBAR_Account : "Account",
        SIDEBAR_Tools : "Tools",


        LOCALE_DATEFORMAT: 'DD.MM.YYYY',
        ORDERS_PageName: 'Statistiek',
        ORDERS_ChartLabelConfCommission: 'Bevestigde commissie',
        ORDERS_ChartLabelTotalSales: 'Totaal orders',
        ORDERS_SHOW_STATISTICS: 'Statistieken',
        ORDERS_BY_DAY: 'Naar dag',
        ORDERS_BY_PROGRAM: 'Naar programma',
        ORDERS_ProgramName: 'Programmanaam',
        ORDERS_Date: 'Datum',
        ORDERS_Views: 'Views',
        ORDERS_Clicks: 'Clicks',
        ORDERS_Open: 'Open',
        ORDERS_Confirmed: 'Bevestigd',
        ORDERS_Cancelled: 'Geannuleerd',
        ORDERS_Sales_Leads: 'Sales/Leads',
        ORDERS_Commission: 'Commissie',
        ORDERS_MoreStatistics: 'Meer statistieken',
        NEWS_PageName: 'Nieuws',
        NEWS_NewPrograms: 'Nieuwe programma´s',
        NEWS_NewVouchers: 'Nieuwe kortingscodes',
        NEWS_Image: 'Afbeelding',
        NEWS_ProgramName: 'Programmanaam',
        NEWS_Apply: 'Aanmelden',
        NEWS_VoucherName: 'Naam kortingscode',
        NEWS_ApplyNow: 'Nu aanmelden',
        SETTINGS_PageName: 'Instellingen',
        SETTINGS_LoginData: 'Login data',
        SETTINGS_PublisherId: 'Publisher ID',
        SETTINGS_WebservicePassword: 'Webservice wachtwoord',
        SETTINGS_save: 'Opslaan',
        SETTINGS_about: 'Help',
        SETTINGS_findYouPassLinkText: 'Hier vind je je webservice wachtwoord', // todo pluralize


        SETTINGS_CountryPlatform: 'affilinet landenplatform',
        SETTINGS_CountryPlatformDE: 'affilinet Duitsland',
        SETTINGS_CountryPlatformEN: 'affilinet Verenigd Koninkrijk',
        SETTINGS_CountryPlatformFR: 'affilinet Frankrijk',
        SETTINGS_CountryPlatformCH: 'affilinet Zwitserland',
        SETTINGS_CountryPlatformAT: 'affilinet Oostenrijk',
        SETTINGS_CountryPlatformES: 'affilinet Spanje',
        SETTINGS_CountryPlatformNL: 'affilinet Benelux',



        APPLY_PageName: 'Nu aanmelden',
        APPLY_ProgramDesc: 'Programmabeschrijving',
        APPLY_ProgramLimits: 'Programma beperkingen',
        APPLY_LinkToSite: 'Link naar website',
        APPLY_ProgramStartStatus: 'Programma start/status',
        APPLY_PartnerShipStatus: 'Partnerschap status',
        APPLY_ApplyNow: 'Nu aanmelden',
        Active: 'Actief',
        Paused: 'Gepauzeerd',
        Waiting: 'Wachtend',
        Refused: 'Afgekeurd',
        Cancelled: 'Beëindigd',
        NoPartnership: 'Geen partnerschap',
        GETCREATIVES_PageName: 'Advertentiemateriaal',
        GETCREATIVES_SelectSize: 'Grootte selecteren',
        GETCREATIVES_CopyCode: 'AdCode kopiëren',
        GETCREATIVES_preview: 'Bekijk advertentie',
        GETVOUCHERS_PageName: 'Kortingscodes',
        GETVOUCHERS_ProgramName: 'Programmanaam',
        GETVOUCHERS_VoucherName: 'Naam kortingscode',
        GETVOUCHERS_Properties: 'Eigenschappen',
        GETVOUCHERS_Code: 'Code',
        GETVOUCHERS_ApplyNowCopyCode: 'Aanmelden/Code kopiëren',
        GETVOUCHERS_AllCustomers: 'Alle klanten',
        GETVOUCHERS_MinimumOrderValue: 'Minimum bestelwaarde',
        SpecificProducts: 'Specifieke producten',
        AllProducts: 'Alle producten',
        FreeProduct: 'Gratis product',
        GETVOUCHERS_ApplyNow: 'Nu aanmelden',
        GETVOUCHERS_CopyVoucherCode: 'Kortingscode kopiëren',

        IMPRESSUM_LINK: 'https://www.affili.net/nl/footeritem/contact',




    });


    $translateProvider.useSanitizeValueStrategy(null);
    switch (navigator.language) {
        case 'de-DE':
        case 'de-de':
        case 'de-AT':
        case 'de-at':
        case 'de-CH':
        case 'de-ch':
        case 'de-li':
        case 'de-LI':
        case 'de-LU':
        case 'de-lu':
        case 'de':
        case 'at':
        case 'ch':
            $translateProvider.preferredLanguage('de');
            break;

        case 'es-ES' :
        case 'es-es' :
        case 'es-AR' :
        case 'es-BO' :
        case 'es-CL' :
        case 'es-CO' :
        case 'es-CR' :
        case 'es-DO' :
        case 'es-EC' :
        case 'es-GT' :
        case 'es-HN' :
        case 'es-MX' :
        case 'es-NI' :
        case 'es-PA' :
        case 'es-PE' :
        case 'es-PR' :
        case 'es-PY' :
        case 'es-SV' :
        case 'es-UY' :
        case 'es-VE' :
        case 'es' :
            $translateProvider.preferredLanguage('es');
            break;

        case 'fr-BE' :
        case 'fr-CA' :
        case 'fr-ca' :
        case 'fr-FR' :
        case 'fr-fr' :
        case 'fr-CH' :
        case 'fr-ch' :
        case 'fr-LU' :
        case 'fr-lu' :
        case 'fr-MC' :
        case 'fr-mc' :
        case 'fr' :
            $translateProvider.preferredLanguage('fr');
            break;

        case 'nl-NL' :
        case 'nl-nl' :
        case 'nl-BE' :
        case 'nl-be' :
        case 'nl' :
        case 'be' :
            $translateProvider.preferredLanguage('nl');
            break;

        default:
            $translateProvider.preferredLanguage('en');
            break;


    }


}).run(function(editableOptions, editableThemes) {
    // set `default` theme
    editableOptions.theme = 'bs3';

    editableThemes['bs3'].submitTpl = '<button class="btn btn-primary" type="submit"><i class="fa fa-check"</button>';
    editableThemes['bs3'].cancelTpl = '<button class="btn btn-default"><i class="fa fa-times-circle"></i></button>';

});


