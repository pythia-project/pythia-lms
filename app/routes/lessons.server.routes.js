'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var lessons = require('../../app/controllers/lessons.server.controller');

	// Lessons Routes
	app.route('/lessons')
		.get(lessons.list)
		.post(users.requiresLogin, lessons.create);

	app.route('/lessons/:lessonId')
		.get(lessons.read)
		.put(users.requiresLogin, lessons.hasAuthorization, lessons.update)
		.delete(users.requiresLogin, lessons.hasAuthorization, lessons.delete);

	// Finish by binding the Lesson middleware
	app.param('lessonId', lessons.lessonByID);
};
