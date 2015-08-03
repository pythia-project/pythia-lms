'use strict';

// Sequences controller
angular.module('sequences').controller('SequencesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Courses', 'Sequences', function($scope, $stateParams, $location, Authentication, Courses, Sequences) {
	$scope.authentication = Authentication;

	// Create new sequence
	$scope.create = function() {
		// Create new sequence object
		var sequence = new Sequences ({
			name: this.name,
			description: this.description,
			courseSerial: $scope.course.serial
		});
		// Redirect after save
		sequence.$save(function(response) {
			$location.path('courses/' + $scope.course.serial + '/sequences/' + response.sequenceIndex);

			// Clear form fields
			$scope.name = '';
			$scope.description = '';
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Remove existing sequence
	$scope.remove = function(sequence) {
		if (sequence) {
			sequence.$remove();
			for (var i in $scope.sequences) {
				if ($scope.sequences [i] === sequence) {
					$scope.sequences.splice(i, 1);
				}
			}
		} else {
			$scope.sequence.$remove(function() {
				$location.path('sequences');
			});
		}
	};

	// Update existing sequence
	$scope.update = function() {
		var sequence = $scope.sequence;
		sequence.$update({
			courseSerial: $scope.courseSerial,
			sequenceIndex: $scope.sequenceIndex
		}, function() {
			$location.path('courses/' + $scope.courseSerial + '/sequences/' + $scope.sequenceIndex);
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});
	};

	// Find a list of sequences
	$scope.find = function() {
		$scope.sequences = Sequences.query();
	};

	// Find existing sequence
	$scope.findOne = function() {
		$scope.courseSerial = $stateParams.courseSerial;
		$scope.sequenceIndex = $stateParams.sequenceIndex;
		$scope.sequence = Sequences.get({
			courseSerial: $stateParams.courseSerial,
			sequenceIndex: $stateParams.sequenceIndex
		});
	};

	// Find existing course
	$scope.findCourse = function() {
		$scope.course = Courses.get({ 
			courseSerial: $stateParams.courseSerial
		});
	};
}]);
