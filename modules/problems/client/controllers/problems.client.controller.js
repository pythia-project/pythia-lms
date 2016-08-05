(function () {
  'use strict';

  angular
    .module('problems')
    .controller('ProblemsController', ProblemsController);

  ProblemsController.$inject = ['$scope', '$state', 'problemResolve', '$window', 'Authentication'];

  function ProblemsController($scope, $state, problem, $window, Authentication) {
    var vm = this;

    vm.problem = problem;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.save = save;

    // Save problem
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.problemForm');
        return false;
      }

      // Create a new problem, or update the current instance
      vm.problem.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('problems.view', {
          problemId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
