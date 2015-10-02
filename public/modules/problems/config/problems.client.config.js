'use strict';

// Set up the menu for the problems module
angular.module('courses').run(['Menus', function(Menus) {
	// Set manage menu items
	Menus.addSubMenuItem('topbar', 'manage', 'MENU.PROBLEMS', 'problems/manage', 'problems/manage', false, ['admin']);
}]);
