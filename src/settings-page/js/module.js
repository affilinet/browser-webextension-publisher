angular.module('AffilinetToolbar', [
    'ui.bootstrap',
    'ui.router',
    'angular-momentjs',
    'xml',
    'template',
    'angular-flot',
    'angular-clipboard',
    'pascalprecht.translate'
], function ($compileProvider) {
    "use strict";
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|resource):/);

}).config(function ($httpProvider, $sceDelegateProvider, $translateProvider) {
    $httpProvider.interceptors.push('xmlHttpInterceptor');
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self'
    ]);

    $translateProvider.translations('en', {
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

        NEWS_PageName: 'News',
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
        SETTINGS_WebservicePassword: 'Webservice Password',
        SETTINGS_save: 'Save',
        SETTINGS_about: 'Help',
        SETTINGS_findYouPassLinkText: 'Find your Webservice Password',
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
        IMPRESSUM_LINK: 'https://www.affili.net/uk/about-affilinet/contact'


    });


    $translateProvider.translations('de', {
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
        NEWS_PageName: 'News',
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
        SETTINGS_WebservicePassword: 'Webservice Passwort',
        SETTINGS_save: 'Speichern',
        SETTINGS_about: 'Hilfe',
        SETTINGS_findYouPassLinkText: 'Hier finden Sie Ihr Webservice Passwort',

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

        IMPRESSUM_LINK: 'https://www.affili.net/de/footeritem/impressum'
    });

    $translateProvider.translations('fr', {
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
        SETTINGS_findYouPassLinkText: 'Trouver mon mot de passe Webservice',

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

        IMPRESSUM_LINK: 'https://www.affili.net/fr/footeritem/contact'
    });


    $translateProvider.translations('es', {
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
        SETTINGS_findYouPassLinkText: 'Encontrar tu Contraseña de WebServices',

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

        IMPRESSUM_LINK: 'https://www.affili.net/es/footeritem/aviso-legal'
    });


    $translateProvider.translations('nl', {
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
        SETTINGS_findYouPassLinkText: 'Hier vind je je webservice wachtwoord',


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

        IMPRESSUM_LINK: 'https://www.affili.net/nl/footeritem/contact'
    });


    $translateProvider.useSanitizeValueStrategy('escape');
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


});



