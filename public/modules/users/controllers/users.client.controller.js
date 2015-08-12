'use strict';

// Users controller
angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', '$http', '$filter', 'Authentication', 'Users', function($scope, $stateParams, $location, $http, $filter, Authentication, Users) {
	$scope.authentication = Authentication;

	// Find a list of users
	$scope.find = function(filter) {
		$scope.users = Users.query();
	};
}]);
