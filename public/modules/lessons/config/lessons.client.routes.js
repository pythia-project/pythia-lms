'use strict';

//Setting up route
angular.module('lessons').config(['$stateProvider',
	function($stateProvider) {
		// Lessons state routing
		$stateProvider.
		state('listLessons', {
			url: '/lessons',
			templateUrl: 'modules/lessons/views/list-lessons.client.view.html'
		}).
		state('createLesson', {
			url: '/courses/:courseSerial/sequences/:sequenceIndex/lessons/create',
			templateUrl: 'modules/lessons/views/create-lesson.client.view.html'
		}).
		state('viewLesson', {
			url: '/lessons/:lessonId',
			templateUrl: 'modules/lessons/views/view-lesson.client.view.html'
		}).
		state('editLesson', {
			url: '/lessons/:lessonId/edit',
			templateUrl: 'modules/lessons/views/edit-lesson.client.view.html'
		});
	}
]);