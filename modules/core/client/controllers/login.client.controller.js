(function () {
  'use strict';

  angular
    .module('core')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', '$state', '$http', '$location', 'Authentication'];

  function LoginController($scope, $state, $http, $location, Authentication) {
    var vm = this;

    vm.authentication = Authentication;
    vm.signin = signin;

    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;

    function signin(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.signinForm');

        return false;
      }

      $http.post('/api/auth/signin', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());
