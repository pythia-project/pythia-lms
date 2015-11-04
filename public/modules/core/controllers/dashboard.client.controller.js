'use strict';

angular.module('core').controller('DashboardController', ['$scope', 'Authentication', 'News', '$http', function($scope, Authentication, News, $http) {
	$scope.authentication = Authentication;

	// Find a list of news
	$scope.findNews = function() {
		$scope.news = News.query();
	};

	// Find all registered courses
	$scope.findRegisteredCourses = function() {
		$http.get('/users/registrations').success(function(data, status, header, config) {
			$scope.registrations = data;
		});
	};

	// Get the progress for a given registration
	$scope.getProgress = function(registration) {
		return parseInt(registration.progress * 100.0);
	};
}]);
