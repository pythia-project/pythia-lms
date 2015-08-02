'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var courses = require('../../app/controllers/courses.server.controller');

	// Courses routes
	app.route('/courses')
		.get(courses.list);

	app.route('/courses/:courseSerial')
		.get(courses.read)
		.post(users.requiresLogin, courses.create)
		.put(users.requiresLogin, courses.hasAuthorization, courses.update)
		.delete(users.requiresLogin, courses.hasAuthorization, courses.delete);

	// Finish by binding the course middleware
	app.param('courseSerial', courses.courseBySerial);
};
