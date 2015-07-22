'use strict';

(function() {
	// Sequences Controller Spec
	describe('Sequences Controller Tests', function() {
		// Initialize global variables
		var SequencesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Sequences controller.
			SequencesController = $controller('SequencesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Sequence object fetched from XHR', inject(function(Sequences) {
			// Create sample Sequence using the Sequences service
			var sampleSequence = new Sequences({
				name: 'New Sequence'
			});

			// Create a sample Sequences array that includes the new Sequence
			var sampleSequences = [sampleSequence];

			// Set GET response
			$httpBackend.expectGET('sequences').respond(sampleSequences);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.sequences).toEqualData(sampleSequences);
		}));

		it('$scope.findOne() should create an array with one Sequence object fetched from XHR using a sequenceId URL parameter', inject(function(Sequences) {
			// Define a sample Sequence object
			var sampleSequence = new Sequences({
				name: 'New Sequence'
			});

			// Set the URL parameter
			$stateParams.sequenceId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/sequences\/([0-9a-fA-F]{24})$/).respond(sampleSequence);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.sequence).toEqualData(sampleSequence);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Sequences) {
			// Create a sample Sequence object
			var sampleSequencePostData = new Sequences({
				name: 'New Sequence'
			});

			// Create a sample Sequence response
			var sampleSequenceResponse = new Sequences({
				_id: '525cf20451979dea2c000001',
				name: 'New Sequence'
			});

			// Fixture mock form input values
			scope.name = 'New Sequence';

			// Set POST response
			$httpBackend.expectPOST('sequences', sampleSequencePostData).respond(sampleSequenceResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Sequence was created
			expect($location.path()).toBe('/sequences/' + sampleSequenceResponse._id);
		}));

		it('$scope.update() should update a valid Sequence', inject(function(Sequences) {
			// Define a sample Sequence put data
			var sampleSequencePutData = new Sequences({
				_id: '525cf20451979dea2c000001',
				name: 'New Sequence'
			});

			// Mock Sequence in scope
			scope.sequence = sampleSequencePutData;

			// Set PUT response
			$httpBackend.expectPUT(/sequences\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/sequences/' + sampleSequencePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid sequenceId and remove the Sequence from the scope', inject(function(Sequences) {
			// Create new Sequence object
			var sampleSequence = new Sequences({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Sequences array and include the Sequence
			scope.sequences = [sampleSequence];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/sequences\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSequence);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.sequences.length).toBe(0);
		}));
	});
}());