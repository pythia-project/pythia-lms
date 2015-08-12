'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Course = mongoose.model('Course'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a course
 */
exports.create = function(req, res) {
	var course = new Course(req.body);
	course.user = req.user;
	course.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(course);
	});
};

/**
 * Show the current course
 */
exports.read = function(req, res) {
	res.jsonp(req.course);
};

/**
 * Update a course
 */
exports.update = function(req, res) {
	var course = req.course;
	course = _.extend(course, req.body);
	course.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(course);
	});
};

/**
 * Delete a course
 */
exports.delete = function(req, res) {
	var course = req.course;
	course.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(course);
	});
};

/**
 * List of courses
 */
exports.list = function(req, res) {
	switch (req.query.filter) {
		case 'all':
			Course.find({}, 'serial title visible').exec(function(err, courses) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				res.jsonp(courses);
			});
		return;

		case 'opened':
			Course.find({}, 'serial title visible').where('visible').equals(true).exec(function(err, courses) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				res.jsonp(courses);
			});
		return;

		case 'registered':
			User.populate(req.user, {path: 'registrations.course', select: 'serial title', model: 'Course'}, function(err, user) {
				var courses = [];
				for (var i = 0; i < user.registrations.length; i++) {
					courses.push(user.registrations[i].course);
				}
				res.jsonp(courses);
			});
		return;
	}
	res.jsonp([]);
};

/**
 * Course middleware
 */
exports.courseBySerial = function(req, res, next, serial) {
	Course.findOne({'serial': serial}, 'serial title coordinators description sequences user').populate('coordinators', 'displayname').populate('sequences', 'name start end').exec(function(err, course) {
		if (err) {
			return next(err);
		}
		if (! course) {
			return next(new Error('Failed to load course ' + serial));
		}
		req.course = course;
		next();
	});
};

/**
 * Switch the visibility of a course
 */
exports.switchVisibility = function(req, res, next) {
	var serial = req.course.serial;
	Course.findOne({'serial': serial}, 'visible').exec(function(err, course) {
		if (err) {
			return next(err);
		}
		if (! course) {
			return next(new Error('Failed to load course ' + serial));
		}
		course.visible = ! course.visible;
		course.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			res.jsonp({
				'visible': course.visible
			});
		});
	});
};

/**
 * Register to a course
 */
exports.register = function(req, res, next) {
	var serial = req.course.serial;
	Course.findOne({'serial': serial}, '_id').exec(function(err, course) {
		if (err) {
			return next(err);
		}
		if (! course) {
			return next(new Error('Failed to load course ' + serial));
		}
		req.user.registrations.push({
			'course': course._id
		});
		req.user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			res.jsonp(req.user.registrations[req.user.registrations.length - 1]);
		});
	});
};

/**
 * Course authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// Authorized users for a course are admin and coordinators
	var isCoordinator = req.course.coordinators.some(function(element, index, array) {
		return element.id === req.user.id;
	});
	if (req.user.roles.indexOf('admin') === -1 && ! isCoordinator) {
		return res.status(403).send('User is not authorized.');
	}
	next();
};

/*
 * Test registration station of the user to the course
 */
exports.isRegistered = function(check) {
	var _this = this;
	return function(req, res, next) {
		var isRegistered = req.user.registrations.some(function(element, index, array) {
			return element.course.toString() === req.course.id;
		});
		if (! check && isRegistered) {
			return res.status(403).send('User is already registered.');
		}
		if (check && ! isRegistered) {
			var isCoordinator = req.course.coordinators.some(function(element, index, array) {
				return element.id === req.user.id;
			});
			if (req.user.roles.indexOf('admin') === -1 && ! isCoordinator) {
				return res.status(403).send('User is not yet registered.');
			}
		}
		next();
	};
};
