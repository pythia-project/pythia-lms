'use strict';

// Users controller
angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$http', 'Authentication', 'Users', function($scope, $stateParams, $http, Authentication, Users) {
	$scope.authentication = Authentication;

	// Find a list of users
	$scope.find = function() {
		$scope.users = Users.query(function() {
			$scope.inactiveusers = 0;
			for (var i = 0; i < $scope.users.length; i++) {
				if (! $scope.users[i].active) {
					$scope.inactiveusers++;
				}
			}
		});
	};

	// Find existing user
	$scope.findOne = function() {
		$scope.user = Users.get({
			username: $stateParams.username
		});
	};

	// Change the active status of a user
	$scope.changeActive = function(user) {
		$http.post('/users/' + user.username + '/switchactive').success(function(data, status, headers, config) {
			user.active = data.active;
		});
	};

	// Delete a user
	$scope.delete = function(user) {
		if (confirm('Are you sure you want to delete the "' + user.username + '" user?')) {
			$http.delete('/users/' + user.username).success(function(data, status, headers, config) {
				for (var i in $scope.users) {
					if ($scope.users[i] === user) {
						$scope.users.splice(i, 1);
					}
				}
			});
		}
	};
}]);