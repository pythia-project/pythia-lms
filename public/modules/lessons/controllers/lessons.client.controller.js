'use strict';

// Lessons controller
angular.module('lessons').controller('LessonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Lessons',
	function($scope, $stateParams, $location, Authentication, Lessons) {
		$scope.authentication = Authentication;

		// Create new Lesson
		$scope.create = function() {
			// Create new Lesson object
			var lesson = new Lessons ({
				name: this.name
			});

			// Redirect after save
			lesson.$save(function(response) {
				$location.path('lessons/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Lesson
		$scope.remove = function(lesson) {
			if ( lesson ) { 
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

		// Update existing Lesson
		$scope.update = function() {
			var lesson = $scope.lesson;

			lesson.$update(function() {
				$location.path('lessons/' + lesson._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Lessons
		$scope.find = function() {
			$scope.lessons = Lessons.query();
		};

		// Find existing Lesson
		$scope.findOne = function() {
			$scope.lesson = Lessons.get({ 
				lessonId: $stateParams.lessonId
			});
		};
	}
]);