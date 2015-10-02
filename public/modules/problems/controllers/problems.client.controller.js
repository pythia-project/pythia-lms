'use strict';

// Problems controller
angular.module('problems').controller('ProblemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Problems', '$sce', function($scope, $stateParams, $location, Authentication, Problems, $sce) {
	$scope.authentication = Authentication;

	// Create new problem
	$scope.create = function() {
		// Create new problem object
		var authors = [];
		for (var i = 0; i < this.authors.length; i++) {
			authors.push(this.authors[i].text);
		}
		var problem = new Problems ({
			name: this.name,
			description: this.description,
			authors: authors,
			points: points,
			task: this.task
		});
		// Redirect after save
		problem.$save(function(response) {
			$location.path('problems/' + response._id);
			// Clear form fields
			$scope.name = '';
			$scope.description = '';
			$scope.authors = [];
			$scope.points = 0;
			$scope.task = {};
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Remove existing problem
	$scope.remove = function(problem) {
	};

	// Update existing problem
	$scope.update = function() {
		var problem = $scope.problem;
		// Get list of authors
		var authors = [];
		for (var i = 0; i < problem.authors.length; i++) {
			authors.push(problem.authors[i].text);
		}
		problem.authors = authors;
		// Save the problem
		problem.$update({
			'problemId': problem._id
		}, function() {
			$location.path('problems/' + problem._id);
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
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
