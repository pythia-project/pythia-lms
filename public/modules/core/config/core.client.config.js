'use strict';

// Set up the menu for the core module
angular.module('core').run(['Menus', function(Menus) {
	// Set top bar menu items
	Menus.addMenuItem('topbar', 'MENU.MANAGE', 'manage', 'dropdown', '/manage', false, ['admin']);
	Menus.addMenuItem('topbar', 'MENU.DASHBOARD', 'dashboard', 'dropdown', '/dashboard', false, ['user']);
}]);
