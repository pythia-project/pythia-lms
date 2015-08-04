'use strict';

//Lessons service used to communicate Lessons REST endpoints
angular.module('lessons').factory('Lessons', ['$resource', function($resource) {
	return $resource('courses/:courseSerial/sequences/:sequenceIndex/lessons/:lessonIndex', {
		courseSerial: '@courseSerial',
		sequenceIndex: '@sequenceIndex'
	}, {
		update: {
			method: 'PUT'
		}
	});
}]);
