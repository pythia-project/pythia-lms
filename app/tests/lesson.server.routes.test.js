'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Lesson = mongoose.model('Lesson'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, lesson;

/**
 * Lesson routes tests
 */
describe('Lesson CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Lesson
		user.save(function() {
			lesson = {
				name: 'Lesson Name'
			};

			done();
		});
	});

	it('should be able to save Lesson instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Lesson
				agent.post('/lessons')
					.send(lesson)
					.expect(200)
					.end(function(lessonSaveErr, lessonSaveRes) {
						// Handle Lesson save error
						if (lessonSaveErr) done(lessonSaveErr);

						// Get a list of Lessons
						agent.get('/lessons')
							.end(function(lessonsGetErr, lessonsGetRes) {
								// Handle Lesson save error
								if (lessonsGetErr) done(lessonsGetErr);

								// Get Lessons list
								var lessons = lessonsGetRes.body;

								// Set assertions
								(lessons[0].user._id).should.equal(userId);
								(lessons[0].name).should.match('Lesson Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Lesson instance if not logged in', function(done) {
		agent.post('/lessons')
			.send(lesson)
			.expect(401)
			.end(function(lessonSaveErr, lessonSaveRes) {
				// Call the assertion callback
				done(lessonSaveErr);
			});
	});

	it('should not be able to save Lesson instance if no name is provided', function(done) {
		// Invalidate name field
		lesson.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Lesson
				agent.post('/lessons')
					.send(lesson)
					.expect(400)
					.end(function(lessonSaveErr, lessonSaveRes) {
						// Set message assertion
						(lessonSaveRes.body.message).should.match('Please fill Lesson name');
						
						// Handle Lesson save error
						done(lessonSaveErr);
					});
			});
	});

	it('should be able to update Lesson instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Lesson
				agent.post('/lessons')
					.send(lesson)
					.expect(200)
					.end(function(lessonSaveErr, lessonSaveRes) {
						// Handle Lesson save error
						if (lessonSaveErr) done(lessonSaveErr);

						// Update Lesson name
						lesson.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Lesson
						agent.put('/lessons/' + lessonSaveRes.body._id)
							.send(lesson)
							.expect(200)
							.end(function(lessonUpdateErr, lessonUpdateRes) {
								// Handle Lesson update error
								if (lessonUpdateErr) done(lessonUpdateErr);

								// Set assertions
								(lessonUpdateRes.body._id).should.equal(lessonSaveRes.body._id);
								(lessonUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Lessons if not signed in', function(done) {
		// Create new Lesson model instance
		var lessonObj = new Lesson(lesson);

		// Save the Lesson
		lessonObj.save(function() {
			// Request Lessons
			request(app).get('/lessons')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Lesson if not signed in', function(done) {
		// Create new Lesson model instance
		var lessonObj = new Lesson(lesson);

		// Save the Lesson
		lessonObj.save(function() {
			request(app).get('/lessons/' + lessonObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', lesson.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Lesson instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Lesson
				agent.post('/lessons')
					.send(lesson)
					.expect(200)
					.end(function(lessonSaveErr, lessonSaveRes) {
						// Handle Lesson save error
						if (lessonSaveErr) done(lessonSaveErr);

						// Delete existing Lesson
						agent.delete('/lessons/' + lessonSaveRes.body._id)
							.send(lesson)
							.expect(200)
							.end(function(lessonDeleteErr, lessonDeleteRes) {
								// Handle Lesson error error
								if (lessonDeleteErr) done(lessonDeleteErr);

								// Set assertions
								(lessonDeleteRes.body._id).should.equal(lessonSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Lesson instance if not signed in', function(done) {
		// Set Lesson user 
		lesson.user = user;

		// Create new Lesson model instance
		var lessonObj = new Lesson(lesson);

		// Save the Lesson
		lessonObj.save(function() {
			// Try deleting Lesson
			request(app).delete('/lessons/' + lessonObj._id)
			.expect(401)
			.end(function(lessonDeleteErr, lessonDeleteRes) {
				// Set message assertion
				(lessonDeleteRes.body.message).should.match('User is not logged in');

				// Handle Lesson error error
				done(lessonDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Lesson.remove().exec();
		done();
	});
});