'use strict';

// Setting up route
angular.module('lessons').config(['$stateProvider',
	function($stateProvider) {
		// Lessons state routing
		$stateProvider
		.state('createLesson', {
			url: '/courses/:courseSerial/sequences/:sequenceIndex/lessons/create',
			templateUrl: 'modules/lessons/views/create-lesson.client.view.html'
		})
		.state('viewLesson', {
			url: '/courses/:courseSerial/sequences/:sequenceIndex/lessons/:lessonIndex',
			templateUrl: 'modules/lessons/views/view-lesson.client.view.html'
		})
		.state('editLesson', {
			url: '/courses/:courseSerial/sequences/:sequenceIndex/lessons/:lessonIndex/edit',
			templateUrl: 'modules/lessons/views/edit-lesson.client.view.html'
		});
	}
]);