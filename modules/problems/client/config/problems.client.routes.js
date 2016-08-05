(function () {
  'use strict';

  angular
    .module('problems.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('problems', {
        abstract: true,
        url: '/problems',
        template: '<ui-view/>'
      })
      .state('problems.list', {
        url: '',
        templateUrl: 'modules/problems/client/views/list-problems.client.view.html',
        controller: 'ProblemsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Problems list'
        }
      })
      .state('problems.create', {
        url: '/create',
        templateUrl: 'modules/problems/client/views/form-problem.client.view.html',
        controller: 'ProblemsController',
        controllerAs: 'vm',
        resolve: {
          problemResolve: newProblem
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Problems Create'
        }
      })
      .state('problems.view', {
        url: '/:problemId',
        templateUrl: 'modules/problems/client/views/view-problem.client.view.html',
        controller: 'ProblemsController',
        controllerAs: 'vm',
        resolve: {
          problemResolve: getProblem
        },
        data: {
          pageTitle: 'Problem {{ problemResolve.title }}'
        }
      });
  }

  getProblem.$inject = ['$stateParams', 'ProblemsService'];

  function getProblem($stateParams, ProblemsService) {
    return ProblemsService.get({
      problemId: $stateParams.problemId
    }).$promise;
  }

  newProblem.$inject = ['ProblemsService'];

  function newProblem(ProblemsService) {
    return new ProblemsService();
  }
}());
