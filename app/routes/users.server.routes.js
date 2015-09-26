'use strict';

/**
 * Module dependencies.
 */
module.exports = function(app) {
	// User routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users')
		.get(users.requiresLogin, users.list)
		.put(users.requiresLogin, users.update);
	app.route('/users/:username')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), users.read);
	app.route('/users/:username/switchactive')
		.post(users.requiresLogin, users.hasAuthorization(['admin']), users.switchActive);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Finish by binding the user middleware
	app.param('username', users.userByUsername);
};
