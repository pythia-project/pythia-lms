'use strict';

//Sequences service used to communicate Sequences REST endpoints
angular.module('sequences').factory('Sequences', ['$resource',
	function($resource) {
		return $resource('sequences/:sequenceId', { sequenceId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);