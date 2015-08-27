'use strict';

// Problems service used to communicate Problems REST endpoints
angular.module('problems').factory('Problems', ['$resource', function($resource) {
	return $resource('problems/:problemId', {
		problemId: '@_id'
	}, {
		update: {
			method: 'PUT'
		}
	});
}]);
