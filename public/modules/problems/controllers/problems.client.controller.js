'use strict';

// Problems controller
angular.module('problems').controller('ProblemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Problems', function($scope, $stateParams, $location, Authentication, Problems) {
	$scope.authentication = Authentication;

	// Create new problem
	$scope.create = function() {
	};

	// Remove existing problem
	$scope.remove = function(problem) {
	};

	// Update existing problem
	$scope.update = function() {
	};

	// Find a list of problems
	$scope.find = function() {
		$scope.problems = Problems.query();
	};

	// Find existing problem
	$scope.findOne = function() {
	};
}]);
