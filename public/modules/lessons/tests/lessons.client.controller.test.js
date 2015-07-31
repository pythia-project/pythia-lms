'use strict';

(function() {
	// Lessons Controller Spec
	describe('Lessons Controller Tests', function() {
		// Initialize global variables
		var LessonsController,
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

			// Initialize the Lessons controller.
			LessonsController = $controller('LessonsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Lesson object fetched from XHR', inject(function(Lessons) {
			// Create sample Lesson using the Lessons service
			var sampleLesson = new Lessons({
				name: 'New Lesson'
			});

			// Create a sample Lessons array that includes the new Lesson
			var sampleLessons = [sampleLesson];

			// Set GET response
			$httpBackend.expectGET('lessons').respond(sampleLessons);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.lessons).toEqualData(sampleLessons);
		}));

		it('$scope.findOne() should create an array with one Lesson object fetched from XHR using a lessonId URL parameter', inject(function(Lessons) {
			// Define a sample Lesson object
			var sampleLesson = new Lessons({
				name: 'New Lesson'
			});

			// Set the URL parameter
			$stateParams.lessonId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/lessons\/([0-9a-fA-F]{24})$/).respond(sampleLesson);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.lesson).toEqualData(sampleLesson);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Lessons) {
			// Create a sample Lesson object
			var sampleLessonPostData = new Lessons({
				name: 'New Lesson'
			});

			// Create a sample Lesson response
			var sampleLessonResponse = new Lessons({
				_id: '525cf20451979dea2c000001',
				name: 'New Lesson'
			});

			// Fixture mock form input values
			scope.name = 'New Lesson';

			// Set POST response
			$httpBackend.expectPOST('lessons', sampleLessonPostData).respond(sampleLessonResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Lesson was created
			expect($location.path()).toBe('/lessons/' + sampleLessonResponse._id);
		}));

		it('$scope.update() should update a valid Lesson', inject(function(Lessons) {
			// Define a sample Lesson put data
			var sampleLessonPutData = new Lessons({
				_id: '525cf20451979dea2c000001',
				name: 'New Lesson'
			});

			// Mock Lesson in scope
			scope.lesson = sampleLessonPutData;

			// Set PUT response
			$httpBackend.expectPUT(/lessons\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/lessons/' + sampleLessonPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid lessonId and remove the Lesson from the scope', inject(function(Lessons) {
			// Create new Lesson object
			var sampleLesson = new Lessons({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Lessons array and include the Lesson
			scope.lessons = [sampleLesson];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/lessons\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleLesson);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.lessons.length).toBe(0);
		}));
	});
}());