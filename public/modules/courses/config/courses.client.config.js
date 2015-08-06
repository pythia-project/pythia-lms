'use strict';

// Set up the menu for the courses module
angular.module('courses').run(['Menus', function(Menus) {
	// Set manage menu items
	Menus.addSubMenuItem('topbar', 'manage', 'Courses', 'courses/manage', 'courses/manage', false, ['admin']);

	// Set dashboard menu items
	Menus.addSubMenuItem('topbar', 'dashboard', 'My courses', 'courses', 'courses', false, ['user']);
	Menus.addSubMenuItem('topbar', 'dashboard', 'Register to a course', 'courses/register', 'courses/register', false, ['user']);
}]);
