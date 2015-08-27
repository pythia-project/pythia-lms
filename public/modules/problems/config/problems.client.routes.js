'use strict';

// Setting up route
angular.module('problems').config(['$stateProvider', function($stateProvider) {
	// Problems state routing
	$stateProvider
	.state('listProblems', {
		url: '/problems/manage',
		templateUrl: 'modules/problems/views/list-problems.client.view.html'
	})
	.state('createProblem', {
		url: '/problems/create',
		templateUrl: 'modules/problems/views/create-problem.client.view.html'
	})
	.state('viewProblem', {
		url: '/problems/:problemId',
		templateUrl: 'modules/problems/views/view-problem.client.view.html'
	});
}]);
