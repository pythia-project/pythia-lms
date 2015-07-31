'use strict';

//Lessons service used to communicate Lessons REST endpoints
angular.module('lessons').factory('Lessons', ['$resource',
	function($resource) {
		return $resource('lessons/:lessonId', { lessonId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);