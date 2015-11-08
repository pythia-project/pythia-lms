'use strict';

// Setting up route
angular.module('courses').config(['$stateProvider', function($stateProvider) {
	// Courses state routing
	$stateProvider
	.state('manageCourses', {
		url: '/courses/manage',
		templateUrl: 'modules/courses/views/manage-courses.client.view.html'
	})
	.state('listCourses', {
		url: '/courses',
		templateUrl: 'modules/courses/views/list-courses.client.view.html'
	})
	.state('registerCourses', {
		url: '/courses/register',
		templateUrl: 'modules/courses/views/register-courses.client.view.html'
	})
	.state('createCourse', {
		url: '/courses/create',
		templateUrl: 'modules/courses/views/create-course.client.view.html'
	})
	.state('viewCourse', {
		url: '/courses/:courseSerial',
		templateUrl: 'modules/courses/views/view-course.client.view.html'
	})
	.state('editCourse', {
		url: '/courses/:courseSerial/edit',
		templateUrl: 'modules/courses/views/edit-course.client.view.html'
	})
	.state('courseRegistrations', {
		url: '/courses/:courseSerial/registrations',
		templateUrl: 'modules/courses/views/course-registration.client.view.html'
	})
	.state('courseStats', {
		url: '/courses/:courseSerial/stats',
		templateUrl: 'modules/courses/views/course-stats.client.view.html'
	})
	.state('courseScoreboard', {
		url: '/courses/:courseSerial/scoreboard',
		templateUrl: 'modules/courses/views/course-scoreboard.client.view.html'
	});
}]);
