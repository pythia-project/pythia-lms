'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = mongoose.model('Course'),
	Sequence = mongoose.model('Sequence');

/**
 * Globals
 */
var user, course, sequence;

/**
 * Unit tests
 */
describe('Sequence Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstname: 'Full',
			lastname: 'Name',
			displayname: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() {
			course = new Course({
				title: 'Course title',
				coordinator: user,
				user: user
			});

			course.save(function() {
				sequence = new Sequence({
					name: 'Sequence name',
					course: course,
					user: user
				});

				done();
			});
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return sequence.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			sequence.name = '';

			return sequence.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Sequence.remove().exec();
		User.remove().exec();

		done();
	});
});