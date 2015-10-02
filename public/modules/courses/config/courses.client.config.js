'use strict';

// Set up the menu for the courses module
angular.module('courses').run(['Menus', function(Menus) {
	// Set manage menu items
	Menus.addSubMenuItem('topbar', 'manage', 'MENU.COURSES', 'courses/manage', 'courses/manage', false, ['admin']);

	// Set dashboard menu items
	Menus.addSubMenuItem('topbar', 'dashboard', 'MENU.MY_COURSES', 'courses', 'courses', false, ['user']);
	Menus.addSubMenuItem('topbar', 'dashboard', 'MENU.REGISTER_COURSE', 'courses/register', 'courses/register', false, ['user']);
}]);
