'use strict';

// Lessons controller
angular.module('lessons').controller('LessonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Courses', 'Lessons', function($scope, $stateParams, $location, Authentication, Courses, Lessons) {
	$scope.authentication = Authentication;

	// Create new lesson
	$scope.create = function() {
		// Create new lesson object
		var lesson = new Lessons ({
			name: this.name,
			context: this.context,
			courseSerial: $scope.course.serial,
			sequenceIndex: $scope.sequenceIndex
		});
		// Redirect after save
		lesson.$save(function(response) {
			$location.path('lessons/' + response._id);

			// Clear form fields
			$scope.name = '';
			$scope.context = '';
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Remove existing lesson
	$scope.remove = function(lesson) {
		if (lesson) {
			lesson.$remove();
			for (var i in $scope.lessons) {
				if ($scope.lessons [i] === lesson) {
					$scope.lessons.splice(i, 1);
				}
			}
		} else {
			$scope.lesson.$remove(function() {
				$location.path('lessons');
			});
		}
	};

	// Update existing lesson
	$scope.update = function() {
		var lesson = $scope.lesson;
		lesson.$update(function() {
			$location.path('lessons/' + lesson._id);
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Find a list of lessons
	$scope.find = function() {
		$scope.lessons = Lessons.query();
	};

	// Find existing lesson
	$scope.findOne = function() {
		$scope.lesson = Lessons.get({ 
			lessonId: $stateParams.lessonId
		});
	};

	// Find existing course
	$scope.findCourse = function() {
		$scope.sequenceIndex = $stateParams.sequenceIndex;
		$scope.course = Courses.get({ 
			courseSerial: $stateParams.courseSerial
		});
	};
}]);
