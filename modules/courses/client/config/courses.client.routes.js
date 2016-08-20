(function () {
  'use strict';

  angular
    .module('courses.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.manage.courses', {
        abstract: true,
        url: '/courses',
        template: '<ui-view/>'
      })
      .state('admin.manage.courses.list', {
        url: '',
        templateUrl: 'modules/courses/client/views/list-courses.client.view.html',
        controller: 'CoursesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Courses list'
        }
      })
      .state('admin.manage.courses.create', {
        url: '/create',
        templateUrl: 'modules/courses/client/views/form-course.client.view.html',
        controller: 'CoursesController',
        controllerAs: 'vm',
        resolve: {
          courseResolve: newCourse
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Courses Create'
        }
      })
      .state('admin.manage.courses.view', {
        url: '/:courseSerial',
        templateUrl: 'modules/courses/client/views/view-course.client.view.html',
        controller: 'CoursesController',
        controllerAs: 'vm',
        resolve: {
          courseResolve: getCourse
        },
        data: {
          pageTitle: '{{courseResolve.serial}} – {{courseResolve.title}}'
        }
      });
  }

  getCourse.$inject = ['$stateParams', 'CoursesService'];

  function getCourse($stateParams, CoursesService) {
    return CoursesService.get({
      courseSerial: $stateParams.courseSerial
    }).$promise;
  }

  newCourse.$inject = ['CoursesService'];

  function newCourse(CoursesService) {
    return new CoursesService();
  }
}());
