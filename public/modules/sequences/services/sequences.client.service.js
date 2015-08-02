'use strict';

// Sequences service used to communicate Sequences REST endpoints
angular.module('sequences').factory('Sequences', ['$resource', function($resource) {
	return $resource('courses/:courseSerial/sequences/:sequenceIndex', {
		courseSerial: '@serial'/*,
		sequenceIndex: '@index'*/
	}, {
		update: {
			method: 'PUT'
		}
	});
}]);
