'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var courses = require('../../app/controllers/courses.server.controller');
	var sequences = require('../../app/controllers/sequences.server.controller');

	// Sequences Routes
	app.route('/courses/:courseSerial/sequences')
		.get(sequences.list)
		.post(users.requiresLogin, sequences.create);

	app.route('/courses/:courseSerial/sequences/:sequenceIndex')
		.get(sequences.read)
		.put(users.requiresLogin, sequences.hasAuthorization, sequences.update)
		.delete(users.requiresLogin, sequences.hasAuthorization, sequences.delete);

	// Finish by binding the sequence middleware
	app.param('sequenceIndex', sequences.sequenceByIndex);
};
