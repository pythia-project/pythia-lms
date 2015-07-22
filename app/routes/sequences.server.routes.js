'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var sequences = require('../../app/controllers/sequences.server.controller');

	// Sequences Routes
	app.route('/sequences')
		.get(sequences.list)
		.post(users.requiresLogin, sequences.create);

	app.route('/sequences/:sequenceId')
		.get(sequences.read)
		.put(users.requiresLogin, sequences.hasAuthorization, sequences.update)
		.delete(users.requiresLogin, sequences.hasAuthorization, sequences.delete);

	// Finish by binding the Sequence middleware
	app.param('sequenceId', sequences.sequenceByID);
};
