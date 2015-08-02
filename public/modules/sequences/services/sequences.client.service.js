'use strict';

// Sequences service used to communicate sequences REST endpoints
angular.module('sequences').factory('Sequences', ['$resource', function($resource) {
	return $resource('courses/:courseSerial/sequences/:sequenceIndex', {
		courseSerial: '@course.serial',
		sequenceIndex: '@index'
	}, {
		update: {
			method: 'PUT'
		}
	});
}]);
