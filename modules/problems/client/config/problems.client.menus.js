(function () {
  'use strict';

  angular
    .module('problems')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin.manage', {
      title: 'Problems',
      state: 'admin.manage.problems.list',
      roles: ['admin']
    });
  }
}());
