'use strict';

// Problems controller
angular.module('problems').controller('ProblemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Problems', '$sce', function($scope, $stateParams, $location, Authentication, Problems, $sce) {
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
		$scope.problem = Problems.get({
			problemId: $stateParams.problemId
		}, function() {
			$scope.problemDescription = $sce.trustAsHtml($scope.problem.description);
		});
	};
}]);
