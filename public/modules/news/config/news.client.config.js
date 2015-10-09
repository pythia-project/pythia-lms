'use strict';

// Set up the menu for the news module
angular.module('news').run(['Menus', function(Menus) {
	// Set manage menu items
	Menus.addSubMenuItem('topbar', 'manage', 'MENU.NEWS', 'news/manage', 'news/manage', false, ['admin']);
}]);
