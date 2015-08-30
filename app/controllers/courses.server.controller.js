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
		// Get all courses
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

		// Get opened courses the user is not registered to
		case 'opened':
			Course.find({}, 'serial title visible').where('visible').equals(true).exec(function(err, courses) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				User.findById(req.user._id, 'registrations', function(err, user) {
					if (err || ! user) {
						return errorHandler.getLoadErrorMessage(err, 'user', req.user._id);
					}
					res.jsonp(courses.filter(function(value) {
						return ! user.registrations.some(function(element, index, array) {
							return element.course.toString() === value.id;
						});
					}));
				});
			});
		return;

		// Get courses the user is registered to
		case 'registered':
			User.findById(req.user._id, 'registrations', function(err, user) {
				if (err || ! user) {
					return errorHandler.getLoadErrorMessage(err, 'user', req.user._id);
				}
				User.populate(user, {path: 'registrations.course', select: 'serial title', model: 'Course'}, function(err, user) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}
					var courses = [];
					for (var i = 0; i < user.registrations.length; i++) {
						courses.push(user.registrations[i].course);
					}
					res.jsonp(courses);
				});
			});
		return;
	}
	res.jsonp([]);
};

/**
 * Course middleware
 */
var findRegistration = function(registrations, course) {
	for (var i = 0; i < registrations.length; i++) {
		if (registrations[i].course.toString() === course.id) {
			return registrations[i];
		}
	}
	return null;
};
exports.courseBySerial = function(req, res, next, serial) {
	Course.findOne({'serial': serial}, '_id serial title coordinators description sequences user').populate('coordinators', 'displayname').populate('sequences', 'name start end').exec(function(err, course) {
		if (err || ! course) {
			return errorHandler.getLoadErrorMessage(err, 'course', serial, next);
		}
		req.course = course;
		// Load registration to this course, if any
		User.findById(req.user._id, 'registrations', function(err, user) {
			if (err || ! user) {
				return errorHandler.getLoadErrorMessage(err, 'user', req.user._id, next);
			}
			req.registration = findRegistration(user.registrations, course);
			next();
		});
	});
};

/**
 * Get the registration to a course
 */
exports.getRegistration = function(req, res) {
	res.jsonp(req.registration);
};

/**
 * Switch the visibility of a course
 */
exports.switchVisibility = function(req, res, next) {
	var serial = req.course.serial;
	Course.findOne({'serial': serial}, 'visible').exec(function(err, course) {
		if (err || ! course) {
			return errorHandler.getLoadErrorMessage(err, 'course', serial, next);
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
	// Get the course
	var serial = req.course.serial;
	Course.findOne({'serial': serial}, '_id').exec(function(err, course) {
		if (err || ! course) {
			return res.status(400).send({
				message: errorHandler.getLoadErrorMessage(err, 'course', serial, next)
			});
		}
		// Get the registrations
		User.findById(req.user._id, 'registrations', function(err, user) {
			if (err || ! user) {
				return res.status(400).send({
					message: errorHandler.getLoadErrorMessage(err, 'user', req.user._id, next)
				});
			}
			// Find if already registered
			if (findRegistration(user.registrations, course) !== null) {
				return res.status(400).send('User is already registered.');
			}
			user.registrations.push({
				'course': course._id
			});
			user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				res.jsonp(user.registrations[user.registrations.length - 1]);
			});
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
 * Test registration status of the user to the course
 */
exports.isRegistered = function(check) {
	var _this = this;
	return function(req, res, next) {
		var isRegistered = req.registration !== null;
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
