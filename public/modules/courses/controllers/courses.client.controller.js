'use strict';

// Courses controller
angular.module('courses').controller('CoursesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Courses', function($scope, $stateParams, $location, Authentication, Courses) {
	$scope.authentication = Authentication;

	// Create new course
	$scope.create = function() {
		// Create new course object
		var course = new Courses ({
			title: this.title,
			description: this.description,
			coordinator: this.coordinator
		});

		// Redirect after save
		course.$save(function(response) {
			$location.path('courses/' + response._id);

			// Clear form fields
			$scope.title = '';
			$scope.description = '';
			$scope.coordinator = '';
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Remove existing course
	$scope.remove = function(course) {
		if (course) { 
			course.$remove();

			for (var i in $scope.courses) {
				if ($scope.courses[i] === course) {
					$scope.courses.splice(i, 1);
				}
			}
		} else {
			$scope.course.$remove(function() {
				$location.path('courses');
			});
		}
	};

	// Update existing course
	$scope.update = function() {
		var course = $scope.course;

		course.$update(function() {
			$location.path('courses/' + course._id);
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Find a list of courses
	$scope.find = function() {
		$scope.courses = Courses.query();
	};

	// Find existing course
	$scope.findOne = function() {
		$scope.course = Courses.get({ 
			courseId: $stateParams.courseId
		});
	};
}]);
