'use strict';

// Courses controller
angular.module('courses').controller('CoursesController', ['$scope', '$stateParams', '$location', '$http', '$filter', 'Authentication', 'Courses', function($scope, $stateParams, $location, $http, $filter, Authentication, Courses) {
	$scope.authentication = Authentication;
	$scope.coordinators = [];
	$scope.score = 0;
	$scope.progress = 0;
	var teachersList = [];
	$scope.studentsList = [];

	// Create new course
	$scope.create = function() {
		// Create new course object
		var coordinatorsIDs = [];
		for (var i = 0; i < this.coordinators.length; i++) {
			coordinatorsIDs.push(this.coordinators[i]._id);
		}
		var course = new Courses ({
			serial: this.serial,
			title: this.title,
			coordinators: coordinatorsIDs,
			description: this.description
		});

		// Redirect after save
		course.$save(function(response) {
			$location.path('courses/' + response.serial);
			// Clear form fields
			$scope.serial = '';
			$scope.title = '';
			$scope.coordinators = [];
			$scope.description = '';
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
		course.$update({
			courseSerial: course.serial
		}, function() {
			$location.path('courses/' + course.serial);
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Find a list of courses
	$scope.find = function(filter) {
		$scope.courses = Courses.query({
			filter: filter
		});
	};

	// Find existing course
	$scope.findOne = function() {
		$scope.course = Courses.get({
			courseSerial: $stateParams.courseSerial
		}, function() {
			$http.get('/registrations/' + $stateParams.courseSerial).success(function(data, status, header, config) {
				$scope.registration = data;
				$scope.score = $scope.registration.score;
				$scope.progress = parseInt($scope.registration.progress * 100);
			});
		});
	};

	// Find stats about course
	$scope.loadStats = function() {
		$scope.registrations = null;
		$http.get('/courses/' + $stateParams.courseSerial + '/registrations').success(function(data, status, header, config) {
			$scope.course = data.course;
			$scope.registrations = data.registrations;
			$scope.maxScore = 0;
			for (var i = 0; i < $scope.registrations.length; i++) {
				if ($scope.registrations[i].score > $scope.maxScore) {
					$scope.maxScore = $scope.registrations[i].score;
				}
			}
			var binsize = $scope.maxScore / 10;
			var bins = [];
			var ticks = [];
			for (var j = 0; j < 10; j++) {
				bins.push([j, 0]);
				ticks.push([j, (parseInt(j * binsize)).toString()]);
			}
			ticks.push([10, $scope.maxScore]);
			for (var k = 0; k < $scope.registrations.length; k++) {
				var p = parseInt($scope.registrations[k].score / binsize);
				bins[Math.min(p, 9)][1]++;
			}
			$scope.scorehisto = [bins];
			$scope.scorehistoopt = {
				bars: {
					show: true
				},
				xaxis: {
					ticks: ticks
				}
			};
		});
	};

	// Find registrations for a course
	$scope.findRegistrations = function() {
		$scope.registrations = null;
		$http.get('/courses/' + $stateParams.courseSerial + '/registrations').success(function(data, status, header, config) {
			$scope.course = data.course;
			$scope.registrations = data.registrations;
		});
	};

	// Get the progress for a given registration
	$scope.getProgress = function(registration) {
		return parseInt (registration.progress * 100.0);
	};

	// Load the list of teachers, for autocompletion of coordinators field
	$scope.initCourseForm = function() {
		$http.get('/users').success(function(data, status, headers, config) {
			teachersList = data;
		});
	};

	// Filter list of available teachers
	$scope.loadTeachers = function(query) {
		return $filter('filter')(teachersList, query);
	};

	// Load the list of students, for autocompletion of register student field
	$scope.initStudentsForm = function() {
		$http.get('/users').success(function(data, status, headers, config) {
			$scope.studentsList = data;
		});
	};

	// Add a student to the registered students for this course
	$scope.addStudent = function(student) {
		if (student !== undefined) {
			$http.post('/courses/' + $scope.course.serial + '/register', {'student': student}).success(function(data, status, headers, config) {
				$scope.registrations.push(data);
			});
		}
	};

	// Change the visibility of a course
	$scope.changeVisibility = function(index) {
		var course = $scope.courses[index];
		$http.post('/courses/' + course.serial + '/switchvisibility').success(function(data, status, headers, config) {
			course.visible = data.visible;
		});
	};

	// Change the privacy of a course
	$scope.changePrivacy = function(index) {
		var course = $scope.courses[index];
		$http.post('/courses/' + course.serial + '/switchprivacy').success(function(data, status, headers, config) {
			course.private = data.private;
		});
	};

	// Register to a course
	$scope.register = function(index) {
		var course = $scope.courses[index];
		$http.post('/courses/' + course.serial + '/register').success(function(data, status, headers, config) {
			$('#courses li:nth-child(' + (index + 1) + ') span').html('<span class="success-icon">Registered <i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>');
		});
	};

	// Build an array of consecutive integers from 0 to n-1
	$scope.getNumber = function(n) {
		var tab = [];
		for (var i = 0; i < n; i++) {
			tab.push(i);
		}
		return tab;
	};

	// Test whether the specified date is before now
	$scope.isBefore = function(date) {
		return moment().isBefore(moment(date));
	};

	// Test whether the specified date is after now
	$scope.isAfter = function(date) {
		return moment().isAfter(moment(date));
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
}]);
