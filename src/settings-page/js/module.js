var app = angular.module('AffilinetToolbar', [
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
    'rzModule',
    'ngSanitize'
], function ($compileProvider) {
    "use strict";
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|resource|chrome-extension|moz-extension):/);

}).config(function ($httpProvider, $sceDelegateProvider, $translateProvider) {

    $httpProvider.interceptors.push('xmlHttpInterceptor');

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self'
    ]);

    $translateProvider.useSanitizeValueStrategy(null);

    $translateProvider.fallbackLanguage('en');

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

})


