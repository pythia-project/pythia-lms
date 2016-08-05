(function () {
  'use strict';

  angular
    .module('problems')
    .controller('ProblemsListController', ProblemsListController);

  ProblemsListController.$inject = ['ProblemsService'];

  function ProblemsListController(ProblemsService) {
    var vm = this;

    vm.problems = ProblemsService.query();
  }
}());
