'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var courses = require('../../app/controllers/courses.server.controller');

	// Courses routes
	app.route('/courses')
		.get(courses.list)
		.post(users.requiresLogin, courses.create);

	app.route('/courses/:courseSerial')
		.get(courses.read)
		.put(users.requiresLogin, courses.hasAuthorization, courses.update)
		.delete(users.requiresLogin, courses.hasAuthorization, courses.delete);

	app.route('/courses/:courseSerial/switchvisibility')
		.post(users.requiresLogin, courses.hasAuthorization, courses.switchVisibility);

	// Finish by binding the course middleware
	app.param('courseSerial', courses.courseBySerial);
};
