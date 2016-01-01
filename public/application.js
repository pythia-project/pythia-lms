'use strict';

// Start by defining the main module and adding the module dependencies
var app = angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

// Configure translation
app.config(['$translateProvider', function($translateProvider) {
	$translateProvider.useSanitizeValueStrategy('escape');
	$translateProvider.useStaticFilesLoader({
		prefix: 'lang/',
		suffix: '.json'
	});
	$translateProvider.preferredLanguage('en_GB');
	$translateProvider.useLocalStorage();
}]);
app.controller('LanguageController', ['$scope', '$translate', '$translateLocalStorage', 'amMoment', function($scope, $translate, $translateLocalStorage, amMoment) {
	$scope.lang = $translateLocalStorage.get('NG_TRANSLATE_LANG_KEY');
	amMoment.changeLocale($scope.lang.substr(0, 2));
	$scope.changeLanguage = function(lang) {
		$translate.use(lang);
		amMoment.changeLocale(lang.substr(0, 2));
	};
}]);

// Initialise MathJax directive
// Source: http://stackoverflow.com/questions/16087146/getting-mathjax-to-update-after-changes-to-angularjs-model
MathJax.Hub.Config({
	tex2jax: { inlineMath: [ ['$','$'], ["\\(","\\)"] ] },
	displayAlign: 'left',
	displayIndent: '2em'
});
MathJax.Hub.Configured();
app.directive("mathjaxBind", function() {
	return {
		restrict: "A",
		controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs) {
			$scope.$watch($attrs.mathjaxBind, function(texExpression) {
				var texScript = angular.element("<script type='math/tex'>").html(texExpression ? texExpression :  "");
				$element.html("");
				$element.append(texScript);
				MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
			});
		}]
	};
});

// Initialise language for moment
app.run(['$rootScope', 'amMoment', function($rootScope, amMoment) {
	amMoment.changeLocale('en');
}]);

// Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') {
		window.location.hash = '#!';
	}

	// Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
