(function (app) {
  'use strict';

  // Start by defining the main module and adding the module dependencies
  angular
    .module(app.applicationModuleName, app.applicationModuleVendorDependencies);

  // Setting HTML5 Location Mode
  angular
    .module(app.applicationModuleName)
    .config(bootstrapConfig);

  function bootstrapConfig($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }

  bootstrapConfig.$inject = ['$locationProvider', '$httpProvider'];

  // Configure translation
  angular
    .module(app.applicationModuleName)
    .config(translationConfig);

  function translationConfig($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useStaticFilesLoader({
      prefix: 'lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en_GB');
    $translateProvider.useLocalStorage();
  }

  translationConfig.$inject = ['$translateProvider'];

  angular
    .module(app.applicationModuleName)
    .controller('LanguageController', languageController);

  function languageController($translate, $translateLocalStorage) {
    var vm = this;

    vm.lang = $translateLocalStorage.get('NG_TRANSLATE_LANG_KEY');
    vm.changeLanguage = changeLanguage;

    function changeLanguage(lang) {
      $translate.use(lang);
    }
  }

  languageController.$inject = ['$translate', '$translateLocalStorage'];

  // Then define the init function for starting up the application
  angular.element(document).ready(init);

  function init() {
    // Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
      if (window.history && history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scroll = {
          top: document.body.scrollTop,
          left: document.body.scrollLeft
        };
        window.location.hash = '';
        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scroll.top;
        document.body.scrollLeft = scroll.left;
      }
    }

    // Then init the app
    angular.bootstrap(document, [app.applicationModuleName]);
  }
}(ApplicationConfiguration));
