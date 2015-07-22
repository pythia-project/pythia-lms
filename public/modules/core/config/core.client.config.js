'use strict';

// Set up the menu for the core module
angular.module('core').run(['Menus', function(Menus) {
	// Set top bar menu items
	Menus.addMenuItem('topbar', 'Manage', 'manage', 'dropdown', '/manage', false, ['admin']);
}]);
