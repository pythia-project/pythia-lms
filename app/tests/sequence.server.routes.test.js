'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = mongoose.model('Course'),
	Sequence = mongoose.model('Sequence'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, course, sequence;

/**
 * Sequence routes tests
 */
describe('Sequence CRUD tests', function() {
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

		// Save a user to the test db and create new sequence
		user.save(function() {
			course = new Course({
				title: 'Course title',
				coordinator: user,
				user: user
			});

			course.save(function() {
				sequence = {
					name: 'Sequence name',
					course: course,
					courseId: course.id
				};

				done();				
			});
		});
	});

	it('should be able to save sequence instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new sequence
				agent.post('/sequences')
					.send(sequence)
					.expect(200)
					.end(function(sequenceSaveErr, sequenceSaveRes) {
						// Handle Sequence save error
						if (sequenceSaveErr) done(sequenceSaveErr);

						// Get a list of sequences
						agent.get('/sequences')
							.end(function(sequencesGetErr, sequencesGetRes) {
								// Handle sequence save error
								if (sequencesGetErr) done(sequencesGetErr);

								// Get sequences list
								var sequences = sequencesGetRes.body;

								// Set assertions
								(sequences[0].course.toString()).should.equal(course.id);
								(sequences[0].name).should.match('Sequence name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save sequence instance if not logged in', function(done) {
		agent.post('/sequences')
			.send(sequence)
			.expect(401)
			.end(function(sequenceSaveErr, sequenceSaveRes) {
				// Call the assertion callback
				done(sequenceSaveErr);
			});
	});

	it('should not be able to save sequence instance if no name is provided', function(done) {
		// Invalidate name field
		sequence.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new sequence
				agent.post('/sequences')
					.send(sequence)
					.expect(400)
					.end(function(sequenceSaveErr, sequenceSaveRes) {
						// Set message assertion
						(sequenceSaveRes.body.message).should.match('Please select a name for the sequence.');
						
						// Handle sequence save error
						done(sequenceSaveErr);
					});
			});
	});

	it('should be able to update sequence instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new sequence
				agent.post('/sequences')
					.send(sequence)
					.expect(200)
					.end(function(sequenceSaveErr, sequenceSaveRes) {
						// Handle sequence save error
						if (sequenceSaveErr) done(sequenceSaveErr);

						// Update sequence name
						sequence.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing sequence
						agent.put('/sequences/' + sequenceSaveRes.body._id)
							.send(sequence)
							.expect(200)
							.end(function(sequenceUpdateErr, sequenceUpdateRes) {
								// Handle sequence update error
								if (sequenceUpdateErr) done(sequenceUpdateErr);

								// Set assertions
								(sequenceUpdateRes.body._id).should.equal(sequenceSaveRes.body._id);
								(sequenceUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of sequences if not signed in', function(done) {
		// Create new sequence model instance
		var sequenceObj = new Sequence(sequence);

		// Save the sequence
		sequenceObj.save(function() {
			// Request sequences
			request(app).get('/sequences')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single sequence if not signed in', function(done) {
		// Create new sequence model instance
		var sequenceObj = new Sequence(sequence);

		// Save the sequence
		sequenceObj.save(function() {
			request(app).get('/sequences/' + sequenceObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', sequence.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete sequence instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new sequence
				agent.post('/sequences')
					.send(sequence)
					.expect(200)
					.end(function(sequenceSaveErr, sequenceSaveRes) {
						// Handle sequence save error
						if (sequenceSaveErr) done(sequenceSaveErr);

						// Delete existing sequence
						agent.delete('/sequences/' + sequenceSaveRes.body._id)
							.send(sequence)
							.expect(200)
							.end(function(sequenceDeleteErr, sequenceDeleteRes) {
								// Handle sequence error error
								if (sequenceDeleteErr) done(sequenceDeleteErr);

								// Set assertions
								(sequenceDeleteRes.body._id).should.equal(sequenceSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete sequence instance if not signed in', function(done) {
		// Set sequence user 
		sequence.user = user;

		// Create new sequence model instance
		var sequenceObj = new Sequence(sequence);

		// Save the sequence
		sequenceObj.save(function() {
			// Try deleting sequence
			request(app).delete('/sequences/' + sequenceObj._id)
			.expect(401)
			.end(function(sequenceDeleteErr, sequenceDeleteRes) {
				// Set message assertion
				(sequenceDeleteRes.body.message).should.match('User is not logged in');

				// Handle sequence error error
				done(sequenceDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Sequence.remove().exec();
		done();
	});
});