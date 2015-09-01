'use strict';

// Lessons controller
angular.module('lessons').controller('LessonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Sequences', 'Lessons', '$sce', '$http', function($scope, $stateParams, $location, Authentication, Sequences, Lessons, $sce, $http) {
	$scope.authentication = Authentication;
	$scope.submissionInProgress = [];
	$scope.progress = 0;
	$scope.score = 0;

	// Create new lesson
	$scope.create = function() {
		// Create new lesson object
		var lesson = new Lessons ({
			name: this.name,
			start: this.start,
			end: this.end,
			context: this.context,
			courseSerial: $scope.courseSerial,
			sequenceIndex: $scope.sequenceIndex
		});
		// Redirect after save
		lesson.$save(function(response) {
			$location.path('courses/' + $scope.courseSerial + '/sequences/' + $scope.sequenceIndex + '/lessons/' + response.lessonIndex);

			// Clear form fields
			$scope.name = '';
			$scope.start = '';
			$scope.end = '';
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
		lesson.$update({
			courseSerial: $scope.courseSerial,
			sequenceIndex: $scope.sequenceIndex,
			lessonIndex: $scope.lessonIndex
		}, function() {
			$location.path('courses/' + $scope.courseSerial + '/sequences/' + $scope.sequenceIndex + '/lessons/' + $scope.lessonIndex);
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Find a list of lessons
	$scope.find = function() {
		$scope.lessons = Lessons.query();
	};

	// Find existing lesson
	var buildProblem = function(index, problem) {
		var content = '<div class="panel panel-default"><div class="panel-heading"><b>Problem ' + index + '</b>: ' + problem.name + '<span class="pull-right"><i>(' + problem.points + ' points)</i></span></div>';
		content += '<div class="panel-body" id="problem-p' + index + '">' + problem.description;
		content += '<div class="text-right">' +
			'<a id="submit-p' + index + '" href="#" onclick="angular.element(document.getElementById(\'lessoncontent\')).scope().submitProblem(' + index + ');event.preventDefault();" class="btn btn-primary">Submit</a>' +
			'</div><div id="feedback-p' + index + '" class="feedback">' +
		'</div>';
		content += '</div></div>';
		return content;
	};
	var updateProgress = function() {
		var score = 0;
		var nbSucceeded = 0;
		// If admin and not registered, registration will be null
		if ($scope.registration !== null && $scope.registration.sequences.length > 0) {
			for (var i = 1; i <= $scope.lesson.problems.length; i++) {
				var problem = $scope.registration.sequences[$stateParams.sequenceIndex - 1].lessons[$stateParams.lessonIndex - 1].problems[i];
				if (problem !== undefined) {
					score += problem.score;
					if (problem.submissions.length > 0) {
						if (problem.submissions[problem.submissions.length - 1].status === 'success') {
							nbSucceeded++;
						}
					}
				}
			}
		}
		$scope.score = score;
		$scope.progress = Math.round(nbSucceeded / $scope.lesson.problems.length * 100.0);
	};
	$scope.findOne = function() {
		$scope.findSequence();
		$scope.lesson = Lessons.get({ 
			courseSerial: $stateParams.courseSerial,
			sequenceIndex: $stateParams.sequenceIndex,
			lessonIndex: $stateParams.lessonIndex
		}, function() {
			// Get the registration information
			$http.get('/registrations/' + $stateParams.courseSerial).success(function(data, status, header, config) {
				$scope.registration = data;
				// Update progress and score information
				updateProgress();
				// Generate the context, replacing placeholders with problems
				var content = $scope.lesson.context;
				for (var i = 1; i <= $scope.lesson.problems.length; i++) {
					content = content.replace('[[' + i + ']]', buildProblem(i, $scope.lesson.problems[i - 1]));
				}
				$scope.lessonContext = $sce.trustAsHtml(content);
			});
		});
	};

	// Find existing sequence
	$scope.findSequence = function() {
		$scope.courseSerial = $stateParams.courseSerial;
		$scope.sequenceIndex = $stateParams.sequenceIndex;
		$scope.lessonIndex = $stateParams.lessonIndex;
		$scope.sequence = Sequences.get({ 
			courseSerial: $stateParams.courseSerial,
			sequenceIndex: $stateParams.sequenceIndex
		});
	};

	// Submit a problem
	var serializeFormToJSON = function($form) {
		var fields = $form.serializeArray();
		var postdata = {};
		for (var i = 0; i < fields.length; i++) {
			postdata[fields[i].name] = fields[i].value;
		}
		return JSON.stringify(postdata);
	};
	$scope.submitProblem = function(index) {
		if (! $scope.submissionInProgress[index - 1]) {
			// Disable submission button and clean feedback field
			$scope.submissionInProgress[index - 1] = true;
			$('#submit-p' + index).addClass('disabled');
			var $feedback = $('#feedback-p' + index);
			$feedback.removeClass();
			$feedback.html('');
			// Send the submission request to the server
			var $form = $('#problem-p' + index + ' form');
			$http.post('/courses/' + $scope.courseSerial + '/sequences/' + $scope.sequenceIndex + '/lessons/' + $scope.lessonIndex + '/problems/' + index + '/submit', {'input': serializeFormToJSON($form)}).success(function(data, status, headers, config) {
				$feedback.addClass('feedback alert');
				// Get the status
				switch (data.status) {
					case 'success':
						$feedback.addClass('alert-success');
					break;
					case 'error':
					case 'failed':
						$feedback.addClass('alert-danger');
					break;
				}
				// Get the feedback
				$feedback.html(data.message);
				// Update scope objects
				var problem = $scope.registration.sequences[$scope.sequenceIndex - 1].lessons[$scope.lessonIndex - 1].problems[index - 1];
				problem.score = data.score;
				problem.submissions = data.submissions;
				updateProgress();
				// Enable submission button
				$scope.submissionInProgress[index - 1] = false;
				$('#submit-p' + index).removeClass('disabled');
			});
		}
	};
}]);
