(function () {
  'use strict';

  angular
    .module('courses')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin.manage', {
      title: 'Courses',
      state: 'admin.manage.courses.list',
      roles: ['admin']
    });
  }
}());
