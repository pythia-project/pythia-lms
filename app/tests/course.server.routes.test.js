'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = mongoose.model('Course'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, course;

/**
 * Course routes tests
 */
describe('Course CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstname: 'Full',
			lastname: 'Name',
			displayname: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new course
		user.save(function() {
			course = {
				title: 'Course title',
				coordinator: user._id
			};

			done();
		});
	});

	it('should be able to save course instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new course
				agent.post('/courses')
					.send(course)
					.expect(200)
					.end(function(courseSaveErr, courseSaveRes) {
						// Handle course save error
						if (courseSaveErr) done(courseSaveErr);

						// Get a list of courses
						agent.get('/courses')
							.end(function(coursesGetErr, coursesGetRes) {
								// Handle Course save error
								if (coursesGetErr) done(coursesGetErr);

								// Get Courses list
								var courses = coursesGetRes.body;

								// Set assertions
								(courses[0].title).should.match('Course title');
								(courses[0].coordinator.toString()).should.equal(userId);
								(courses[0].description).should.match('');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save course instance if not logged in', function(done) {
		agent.post('/courses')
			.send(course)
			.expect(401)
			.end(function(courseSaveErr, courseSaveRes) {
				// Call the assertion callback
				done(courseSaveErr);
			});
	});

	it('should not be able to save course instance if no title is provided', function(done) {
		// Invalidate title field
		course.title = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new course
				agent.post('/courses')
					.send(course)
					.expect(400)
					.end(function(courseSaveErr, courseSaveRes) {
						// Set message assertion
						(courseSaveRes.body.message).should.match('Please select a title for the course.');
						
						// Handle course save error
						done(courseSaveErr);
					});
			});
	});

	it('should not be able to save course instance if no coordinator is provided', function(done) {
		// Invalidate coordinator field
		course.coordinator = null;

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new course
				agent.post('/courses')
					.send(course)
					.expect(400)
					.end(function(courseSaveErr, courseSaveRes) {
						// Set message assertion
						(courseSaveRes.body.message).should.match('Please choose a coordinator for the course.');
						
						// Handle course save error
						done(courseSaveErr);
					});
			});
	});

	it('should be able to update course instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new course
				agent.post('/courses')
					.send(course)
					.expect(200)
					.end(function(courseSaveErr, courseSaveRes) {
						// Handle course save error
						if (courseSaveErr) done(courseSaveErr);

						// Update course title
						course.title = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing course
						agent.put('/courses/' + courseSaveRes.body._id)
							.send(course)
							.expect(200)
							.end(function(courseUpdateErr, courseUpdateRes) {
								// Handle course update error
								if (courseUpdateErr) done(courseUpdateErr);

								// Set assertions
								(courseUpdateRes.body._id).should.equal(courseSaveRes.body._id);
								(courseUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');
								(courseUpdateRes.body.coordinator).should.equal(userId);
								(courseUpdateRes.body.description).should.match(courseSaveRes.body.description);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of courses if not signed in', function(done) {
		// Create new course model instance
		var courseObj = new Course(course);

		// Save the course
		courseObj.save(function() {
			// Request courses
			request(app).get('/courses')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single course if not signed in', function(done) {
		// Create new course model instance
		var courseObj = new Course(course);

		// Save the course
		courseObj.save(function() {
			request(app).get('/courses/' + courseObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('title', course.title);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete course instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new course
				agent.post('/courses')
					.send(course)
					.expect(200)
					.end(function(courseSaveErr, courseSaveRes) {
						// Handle course save error
						if (courseSaveErr) done(courseSaveErr);

						// Delete existing course
						agent.delete('/courses/' + courseSaveRes.body._id)
							.send(course)
							.expect(200)
							.end(function(courseDeleteErr, courseDeleteRes) {
								// Handle course error error
								if (courseDeleteErr) done(courseDeleteErr);

								// Set assertions
								(courseDeleteRes.body._id).should.equal(courseSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete course instance if not signed in', function(done) {
		// Set Course user 
		course.user = user;

		// Create new course model instance
		var courseObj = new Course(course);

		// Save the course
		courseObj.save(function() {
			// Try deleting course
			request(app).delete('/courses/' + courseObj._id)
			.expect(401)
			.end(function(courseDeleteErr, courseDeleteRes) {
				// Set message assertion
				(courseDeleteRes.body.message).should.match('User is not logged in');

				// Handle course error error
				done(courseDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Course.remove().exec();
		done();
	});
});
