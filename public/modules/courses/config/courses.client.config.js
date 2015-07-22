'use strict';

// Set up the menu for the courses module
angular.module('courses').run(['Menus', function(Menus) {
	// Set manage menu items
	Menus.addSubMenuItem('topbar', 'manage', 'Courses', 'courses', 'courses', false, ['admin']);
}]);
