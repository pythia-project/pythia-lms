'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Course = mongoose.model('Course'),
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
			res.jsonp(req.user.registrations);
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
exports.switchVisibility = function(req, res) {
	Course.findOne({'serial': req.course.serial}, 'visible').exec(function(err, course) {
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
 * Course authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.course.user.toString() !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
