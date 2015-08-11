'use strict';

// Lessons controller
angular.module('lessons').controller('LessonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Sequences', 'Lessons', function($scope, $stateParams, $location, Authentication, Sequences, Lessons) {
	$scope.authentication = Authentication;

	// Create new lesson
	$scope.create = function() {
		// Create new lesson object
		var lesson = new Lessons ({
			name: this.name,
			context: this.context,
			courseSerial: $scope.courseSerial,
			sequenceIndex: $scope.sequenceIndex
		});
		// Redirect after save
		lesson.$save(function(response) {
			$location.path('courses/' + $scope.courseSerial + '/sequences/' + $scope.sequenceIndex + '/lessons/' + response.lessonIndex);

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
		$scope.findSequence();$scope.lesson = Lessons.get({ 
			courseSerial: $stateParams.courseSerial,
			sequenceIndex: $stateParams.sequenceIndex,
			lessonIndex: $stateParams.lessonIndex
		}, function() {
			// Generate the context, replacing placeholders with problems
			var content = $scope.lesson.context;
			for (var i = 1; i <= $scope.lesson.problems.length; i++) {
				var problem = $scope.lesson.problems[i - 1];
				content = content.replace('[[' + i + ']]', '<div class="panel panel-default"><div class="panel-heading"><b>Problem ' + i + '</b>: ' + problem.name + '</div><div class="panel-body">' + problem.description + '</div></div>');
			}
			$scope.lessonContext = content;
		});
	};

	// Find existing course
	$scope.findSequence = function() {
		$scope.courseSerial = $stateParams.courseSerial;
		$scope.sequenceIndex = $stateParams.sequenceIndex;
		$scope.lessonIndex = $stateParams.lessonIndex;
		$scope.sequence = Sequences.get({ 
			courseSerial: $stateParams.courseSerial,
			sequenceIndex: $stateParams.sequenceIndex
		});
	};
}]);
