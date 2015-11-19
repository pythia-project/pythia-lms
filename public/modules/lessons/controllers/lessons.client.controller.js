'use strict';

// Lessons controller
angular.module('lessons').controller('LessonsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Courses', 'Sequences', 'Lessons', '$sce', '$http', '$filter', '$compile', function($scope, $stateParams, $location, Authentication, Courses, Sequences, Lessons, $sce, $http, $filter, $compile) {
	$scope.authentication = Authentication;
	$scope.submissionInProgress = [];
	$scope.score = 0;
	$scope.progress = 0;
	$scope.problems = [];
	var problemsList = [];

	// Create new lesson
	$scope.create = function() {
		// Create new lesson object
		var problemsIDs = [];
		for (var i = 0; i < this.problems.length; i++) {
			problemsIDs.push(this.problems[i]._id);
		}
		var lesson = new Lessons ({
			name: this.name,
			start: this.start,
			end: this.end,
			context: this.context,
			problems: problemsIDs,
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

	// Load the list of problems, for autocompletion of problems field
	$scope.initLessonForm = function() {
		$http.get('/problems').success(function(data, status, headers, config) {
			problemsList = data;
		});
	};

	// Filter list of available problems
	$scope.loadProblems = function(query) {
		return $filter('filter')(problemsList, query);
	};

	// Find existing lesson
	// Show feedback
	var showFeedback = function($feedback, status, message) {
		$feedback.addClass('feedback alert');
		// Get the status
		switch (status) {
			case 'success':
				$feedback.addClass('alert-success');
			break;
			case 'error':
			case 'failed':
			case 'timeout':
				$feedback.addClass('alert-danger');
			break;
		}
		// Get the feedback
		$feedback.html(message);
		$compile($feedback)($scope);
	};
	// Build a problem
	var buildProblem = function(index, problem) {
		// Build the content
		var content = '<div><div class="panel panel-default problem"><div class="panel-heading"><b>Problem ' + index + '</b>: ' + problem.name + '<span class="pull-right"><i>(<span id="points-p' + index + '"></span>' + problem.points + ' points)</i>';
		content += ' <span style="display: none" id="success-p' + index + '" class="glyphicon glyphicon-ok success-icon" aria-hidden="true"></span>';
		content += ' <span style="display: none" id="failed-p' + index + '" class="glyphicon glyphicon-remove failed-icon" aria-hidden="true"></span>';
		content += '</span></div><div class="panel-body" id="problem-p' + index + '"><form>' + problem.description + '<div class="form-group text-right">';
		if ($scope.registration !== null) {
			if (problem.maxsubmission > 0) {
				content += '<i>(<span id="submissions-p' + index + '"></span>' + problem.maxsubmission + ' submissions)</i> ';
			}
			content += '<a id="submit-p' + index + '" href="#" onclick="angular.element(document.getElementById(\'lessoncontent\')).scope().submitProblem(' + index + ');event.preventDefault();" class="btn btn-primary">Submit</a>';
		}
		content += '</div><div id="feedback-p' + index + '" class="feedback"></div></form></div></div></div>';
		// If submission, update the form to the last submission
		if ($scope.registration !== null && $scope.registration.sequences.length > 0) {
			var $content = $(content);
			var p = getProblem($scope.registration, $stateParams.sequenceIndex, $stateParams.lessonIndex, index);
			if (p !== undefined && p.submissions.length > 0) {
				var lastsubmission = p.submissions[p.submissions.length - 1];
				// Success/fail icon and score information
				$content.find('#success-p' + index).first().css('display', p.succeeded ? 'inline-block' : 'none');
				$content.find('#failed-p' + index).first().css('display', p.succeeded ? 'none' : 'inline-block');
				$content.find('#points-p' + index).first().text(p.score + '/');
				$content.find('#submissions-p' + index).first().text(p.submissions.length + '/');
				// Form fields
				var answer = JSON.parse(lastsubmission.answer);
				var $form = $content.find('form').first();
				for (var field in answer) {
					var $f = $form.find('input[name="' + field + '"]');
					if ($f.length === 1) {
						$f.attr('value', answer[field]);
					} else {
						$f = $form.find('#' + field + ' ui-codemirror');
						if ($f.length === 1) {
							$f.text(answer[field]);
						}
					}
				}
				// Feedback message
				showFeedback($content.find('#feedback-p' + index).first(), lastsubmission.status, lastsubmission.feedback.message);
			}
			content = $content.html();
		}
		return content;
	};
	// Update the progress and success/failed icons
	var updateProgress = function() {
		var score = 0;
		var nbSucceeded = 0;
		// If admin and not registered, registration will be null
		if ($scope.registration !== null && $scope.registration.sequences.length > 0) {
			var lesson = $scope.registration.sequences[$stateParams.sequenceIndex - 1].lessons[$stateParams.lessonIndex - 1];
			$scope.score = lesson.score;
			$scope.progress = parseInt(lesson.progress * 100);
			for (var i = 1; i <= lesson.problems.length; i++) {
				$('#success-p' + i).css('display', lesson.problems[i - 1].succeeded ? 'inline-block' : 'none');
				$('#failed-p' + i).css('display', lesson.problems[i - 1].succeeded ? 'none' : 'inline-block');
				$('#points-p' + i).text(lesson.problems[i - 1].score + '/');
				if ($('#submissions-p' + i).length === 1) {
					$('#submissions-p' + i).text(lesson.problems[i - 1].submissions.length + '/');
				}
			}
		}
	};
	$scope.findOne = function() {
		$scope.loadCourseAndSequence();
		$scope.lesson = Lessons.get({ 
			courseSerial: $stateParams.courseSerial,
			sequenceIndex: $stateParams.sequenceIndex,
			lessonIndex: $stateParams.lessonIndex
		}, function() {
			// Get the registration information
			$http.get('/registrations/' + $stateParams.courseSerial).success(function(data, status, header, config) {
				$scope.registration = data;
				// Generate the context, replacing placeholders with problems
				var content = $scope.lesson.context;
				for (var i = 1; i <= $scope.lesson.problems.length; i++) {
					content = content.replace('[[' + i + ']]', buildProblem(i, $scope.lesson.problems[i - 1]));
				}
				$scope.lessonContext = $sce.trustAsHtml(content);
				// Update progress and score information
				updateProgress();
			});
		});
	};

	// Find stats about lesson
	$scope.loadStats = function() {
		$scope.loadCourseAndSequence();
		$scope.problemstats = null;
		$http.get('/courses/' + $stateParams.courseSerial + '/sequences/' + $stateParams.sequenceIndex + '/lessons/' + $stateParams.lessonIndex + '/stats').success(function(data, status, header, config) {
			$scope.lesson = data.lesson;
			$scope.problemstats = data.problemstats;
		});
	};

	$scope.getProgress = function(problems) {
		if (problems.length === 0) {
			return 0;
		}
		// Count the number of succeeded problems
		var succeeded = 0;
		for (var i = 0; i < problems.length; i++) {
			var lastsubmission = problems[i].submissions[problems[i].submissions.length - 1];
			if (lastsubmission !== undefined && lastsubmission.status === 'success') {
				succeeded += 1;
			}
		}
		return succeeded / problems.length * 100.0;
	};

	$scope.getScore = function(problems) {
		var score = 0;
		for (var i = 0; i < problems.length; i++) {
			score += problems[i].score;
		}
		return score;
	};

	$scope.getSubmissions = function(problem) {
		var total = 0;
		var succeeded = 0;
		var users = 0;
		var usersubmissions = [];
		for (var i = 0; i < $scope.problemstats.length; i++) {
			if (problem < $scope.problemstats[i].problems.length) {
				var submissions = $scope.problemstats[i].problems[problem].submissions;
				if (submissions !== undefined && submissions.length > 0) {
					usersubmissions.push({
						'user': $scope.problemstats[i].user,
						'submissions': submissions
					});
					total += submissions.length;
					succeeded += $scope.problemstats[i].problems[problem].succeeded ? 1 : 0;
					users += 1;
				}
			}
		}
		return {
			'users': usersubmissions,
			'total': total,
			'succeeded': succeeded,
			'mean' : total / users
		};
	};

	$scope.keys = function(obj) {
		return obj ? Object.keys(obj).sort() : [];
	};

	$scope.renderFeedback = function(feedback) {
		return JSON.stringify(feedback);
	};
	$scope.renderSubmission = function(submission) {
		try {
			var result = '<table class="table table-bordered table-condensed">';
			// Answers
			var a = JSON.parse(submission.answer);
			var fields = $scope.keys(a);
			result += '<tr><th colspan="2">Answers</th></tr>';
			for (var i = 0; i < fields.length; i++) {
				result += '<tr><td style="width: 100px;">' + fields[i] + '</td><td><pre class="empty">' + a[fields[i]] + '</pre></td></tr>';
			}
			// Feedback
			var f = submission.feedback;
			var keys = $scope.keys(f).sort();
			result += '<tr><th colspan="2">Feedback</th></tr>';
			for (var j = 0; j < fields.length; j++) {
				result += '<tr><td style="width: 100px;">' + keys[j] + '</td><td><pre class="empty">' + f[keys[j]] + '</pre></td></tr>';
			}
			result += '</table>';
			return result;
		} catch (err) {
			return '<pre>' + submission.answer + '</pre><pre>' + JSON.stringify(submission.feedback) + '</pre>';
		}
	};

	// Load information about the current course and sequence
	$scope.loadCourseAndSequence = function() {
		$scope.courseSerial = $stateParams.courseSerial;
		$scope.sequenceIndex = $stateParams.sequenceIndex;
		$scope.lessonIndex = $stateParams.lessonIndex;
		// Load course
		$scope.course = Courses.get({
			courseSerial: $stateParams.courseSerial
		});
		// Load sequence
		$scope.previousLesson = null;
		$scope.nextLesson = null;
		$scope.sequence = Sequences.get({ 
			courseSerial: $stateParams.courseSerial,
			sequenceIndex: $stateParams.sequenceIndex
		}, function() {
			// Get the previous lesson in the sequence
			var previous = parseInt($stateParams.lessonIndex) - 1;
			if (previous > 0) {
				$scope.previousLesson = $scope.sequence.lessons[previous - 1];
			}
			// Get the next lesson in the sequence
			var next = parseInt($stateParams.lessonIndex) + 1;
			if (next - 1 < $scope.sequence.lessons.length) {
				$scope.nextLesson = $scope.sequence.lessons[next - 1];
			}
		});
	};

	// Submit a problem
	var serializeFormToJSON = function($form) {
		var fields = $form.serializeArray();
		var postdata = {};
		for (var i = 0; i < fields.length; i++) {
			postdata[fields[i].name] = fields[i].value;
		}
		$form.find('.codefield').each(function() {
			postdata[$(this).attr('id')] = $(this).find('.CodeMirror')[0].CodeMirror.getValue();
		});
		return JSON.stringify(postdata);
	};
	var getProblem = function(registration, sequenceIndex, lessonIndex, problemIndex) {
		// Fill the registration object if necessary
		// Get the sequence
		while (registration.sequences.length < sequenceIndex) {
			registration.sequences.push({'lessons': []});
		}
		var sequence = registration.sequences[sequenceIndex - 1];
		// Get the lesson
		while (sequence.lessons.length < lessonIndex) {
			sequence.lessons.push({'problems': []});
		}
		var lesson = sequence.lessons[lessonIndex - 1];
		// Get the problem
		while (lesson.problems.length < problemIndex) {
			lesson.problems.push({'score': 0, 'submissions': []});
		}
		return lesson.problems[problemIndex - 1];
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
				showFeedback($feedback, data.status, data.message);
				// Update scope objects
				var problem = getProblem($scope.registration, $scope.sequenceIndex, $scope.lessonIndex, index);
				problem.score = data.score;
				$scope.registration = data.registration;
				updateProgress();
				// Enable submission button
				$scope.submissionInProgress[index - 1] = false;
				$('#submit-p' + index).removeClass('disabled');
			});
		}
	};

	// Build an array of consecutive integers from 0 to n-1
	$scope.getNumber = function(n) {
		var tab = [];
		for (var i = 0; i < n; i++) {
			tab.push(i);
		}
		return tab;
	};

	// Test whether the current user has one of the specified roles
	$scope.hasRole = function(roles) {
		return $scope.authentication.user && roles.some(function(element, index, array) {
			return $scope.authentication.user.roles.indexOf(element) !== -1;
		});
	};

	// Test whether the current user is a coordinator of this course
	$scope.isCoordinator = function() {
		return $scope.authentication.user && $scope.course.coordinators.some(function(element, index, array) {
			return $scope.authentication.user._id === element._id;
		});
	};

	// Test whether the specified date is before now
	$scope.isBefore = function(date) {
		return moment().isBefore(moment(date));
	};

	// Test whether the specified date is after now
	$scope.isAfter = function(date) {
		return moment().isAfter(moment(date));
	};

	// Convert a string to an int
	$scope.parseint = function(data) {
		return parseInt(data);
	};
}]);
