'use strict';

angular.module('core').controller('DashboardController', ['$scope', 'Authentication', 'News', function($scope, Authentication, News) {
	$scope.authentication = Authentication;

	// Find a list of news
	$scope.findNews = function() {
		$scope.news = News.query();
	};
}]);
