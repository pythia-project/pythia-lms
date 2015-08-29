'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var courses = require('../../app/controllers/courses.server.controller');
	var sequences = require('../../app/controllers/sequences.server.controller');

	// Sequences Routes
	app.route('/courses/:courseSerial/sequences')
		.get(users.requiresLogin, courses.isRegistered(true), sequences.list)
		.post(users.requiresLogin, courses.hasAuthorization, sequences.create);

	app.route('/courses/:courseSerial/sequences/:sequenceIndex')
		.get(users.requiresLogin, courses.isRegistered(true), sequences.hasAuthorization, sequences.read)
		.put(users.requiresLogin, courses.hasAuthorization, sequences.update)
		.delete(users.requiresLogin, courses.hasAuthorization, sequences.delete);

	// Finish by binding the sequence middleware
	app.param('sequenceIndex', sequences.sequenceByIndex);
};
