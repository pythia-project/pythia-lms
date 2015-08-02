'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Course = mongoose.model('Course'),
	Sequence = mongoose.model('Sequence'),
	_ = require('lodash');

/**
 * Create a sequence
 */
exports.create = function(req, res) {
	// Check course
	var courseId = req.body.course._id;
	Course.findById(courseId, 'sequences').exec(function(err, course) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (! course) {
			return res.status(400).send({
				message: 'Failed to load course ' + courseId
			});
		}
		var sequence = new Sequence({
			'name': req.body.name,
			'course': course._id,
			'description': req.body.description
		});
		sequence.user = req.user;
		sequence.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			// Add the sequence to the course
			course.sequences.push(sequence);
			course.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				res.jsonp(sequence);
			});
		});
	});
};

/**
 * Show the current Sequence
 */
exports.read = function(req, res) {
	res.jsonp(req.sequence);
};

/**
 * Update a Sequence
 */
exports.update = function(req, res) {
	var sequence = req.sequence;
	req.body.course = req.body.course._id;
	sequence = _.extend(sequence, req.body);
	sequence.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(sequence);
	});
};

/**
 * Delete an Sequence
 */
exports.delete = function(req, res) {
	var sequence = req.sequence;
	sequence.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(sequence);
	});
};

/**
 * List of Sequences
 */
exports.list = function(req, res) { 
	Sequence.find().exec(function(err, sequences) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(sequences);
	});
};

/**
 * Sequence middleware
 */
exports.sequenceByIndex = function(req, res, next, index) {
	Sequence.findById({'_id': req.course.sequences[index - 1]._id}, 'name course').populate('course', 'serial').exec(function(err, sequence) {
		if (err) {
			return next(err);
		}
		if (! sequence) {
			return next(new Error('Failed to load sequence ' + id));
		}
		req.sequence = sequence;
		next();
	});
};

/**
 * Sequence authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.sequence.user.toString() !== req.user.id) {
		return res.status(403).send('User is not authorized.');
	}
	next();
};
