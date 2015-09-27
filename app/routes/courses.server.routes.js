'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var courses = require('../../app/controllers/courses.server.controller');

	// Courses routes
	app.route('/courses')
		.get(users.requiresLogin, courses.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), courses.create);

	app.route('/courses/:courseSerial')
		.get(users.requiresLogin, courses.isRegistered(true), courses.read)
		.put(users.requiresLogin, courses.hasAuthorization, courses.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), courses.delete);

	app.route('/registrations/:courseSerial')
		.get(users.requiresLogin, courses.isRegistered(true), courses.getRegistration);

	app.route('/courses/:courseSerial/switchvisibility')
		.post(users.requiresLogin, courses.hasAuthorization, courses.switchVisibility);

	app.route('/courses/:courseSerial/register')
		.post(users.requiresLogin, courses.isRegistered(false), courses.register);

	app.route('/courses/:courseSerial/registrations')
		.get(users.requiresLogin, courses.hasAuthorization, courses.getRegistrations);

	// Finish by binding the course middleware
	app.param('courseSerial', courses.courseBySerial);
};
