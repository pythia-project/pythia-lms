'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var courses = require('../../app/controllers/courses.server.controller');
	var lessons = require('../../app/controllers/lessons.server.controller');

	// Lessons Routes
	app.route('/courses/:courseSerial/sequences/:sequenceIndex/lessons')
		.get(lessons.list)
		.post(users.requiresLogin, lessons.create);

	app.route('/lessons/:lessonId')
		.get(lessons.read)
		.put(users.requiresLogin, lessons.hasAuthorization, lessons.update)
		.delete(users.requiresLogin, lessons.hasAuthorization, lessons.delete);

	// Finish by binding the lesson middleware
	app.param('lessonId', lessons.lessonByID);
};
