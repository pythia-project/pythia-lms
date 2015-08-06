'use strict';

// Courses controller
angular.module('courses').controller('CoursesController', ['$scope', '$stateParams', '$location', '$http', '$filter', 'Authentication', 'Courses', function($scope, $stateParams, $location, $http, $filter, Authentication, Courses) {
	$scope.authentication = Authentication;
	$scope.coordinators = [];
	var teachersList = [];

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
		});
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
}]);
