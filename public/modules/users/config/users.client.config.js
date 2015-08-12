'use strict';

// Set up the menu for the users module
angular.module('users').run(['Menus', function(Menus) {
	// Set manage menu items
	Menus.addSubMenuItem('topbar', 'manage', 'Users', 'users/manage', 'users/manage', false, ['admin']);
}]);

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider', function($httpProvider) {
	// Set the httpProvider "not authorized" interceptor
	$httpProvider.interceptors.push(['$q', '$location', 'Authentication', function($q, $location, Authentication) {
		return {
			responseError: function(rejection) {
				switch (rejection.status) {
					case 401:
						// Deauthenticate the global user
						Authentication.user = null;

						// Redirect to signin page
						$location.path('signin');
					break;

					case 403:
						// Add unauthorized behaviour 
					break;
				}
				return $q.reject(rejection);
			}
		};
	}]);
}]);
