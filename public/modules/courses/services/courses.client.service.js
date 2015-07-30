'use strict';

// Courses service used to communicate courses REST endpoints
angular.module('courses').factory('Courses', ['$resource', function($resource) {
	return $resource('courses/:courseSerial', {
		courseSerial: '@serial'
	}, {
		update: {
			method: 'PUT'
		}
	});
}]);
