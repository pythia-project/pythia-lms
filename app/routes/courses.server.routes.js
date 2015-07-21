'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var courses = require('../../app/controllers/courses.server.controller');

	// Courses Routes
	app.route('/courses')
		.get(courses.list)
		.post(users.requiresLogin, courses.create);

	app.route('/courses/:courseId')
		.get(courses.read)
		.put(users.requiresLogin, courses.hasAuthorization, courses.update)
		.delete(users.requiresLogin, courses.hasAuthorization, courses.delete);

	// Finish by binding the Course middleware
	app.param('courseId', courses.courseByID);
};
