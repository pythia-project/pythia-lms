(function () {
  'use strict';

  angular
    .module('problems')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Problems',
      state: 'problems',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'problems', {
      title: 'List problems',
      state: 'problems.list',
      roles: ['*']
    });
  }
}());
