'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var problems = require('../../app/controllers/problems.server.controller');

	// Problems routes
	app.route('/problems')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), problems.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), problems.create);

	app.route('/problems/:problemId')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), problems.read);

	// Finish by binding the problem middleware
	app.param('problemId', problems.problemByID);
};
