'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Course = mongoose.model('Course'),
	Sequence = mongoose.model('Sequence'),
	_ = require('lodash'),
	moment = require('moment');

/**
 * Create a sequence
 */
exports.create = function(req, res) {
	// Check course
	var serial = req.body.courseSerial;
	Course.findOne({'serial': serial}, 'serial sequences').exec(function(err, course) {
		if (err || ! course) {
			return res.status(400).send({
				message: errorHandler.getLoadErrorMessage(err, 'course', serial)
			});
		}
		var sequence = new Sequence({
			'name': req.body.name,
			'description': req.body.description,
			'start': req.body.start,
			'end': req.body.end
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
				res.jsonp({
					'sequenceIndex': course.sequences.length
				});
			});
		});
	});
};

/**
 * Show the current sequence
 */
exports.read = function(req, res) {
	res.jsonp(req.sequence);
};

/**
 * Update a sequence
 */
exports.update = function(req, res) {
	var sequence = req.sequence;
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
 * Delete a sequence
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
 * List of sequences
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
	Sequence.findById({'_id': req.course.sequences[index - 1]._id}, 'name description start end lessons user').populate('lessons', 'name').exec(function(err, sequence) {
		if (err || ! sequence) {
			return errorHandler.getLoadErrorMessage(err, 'sequence', index + ' of course ' + req.course.serial, next);
		}
		req.sequence = sequence;
		next();
	});
};

/**
 * Sequence authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// Authorized sequence if current date between start and end date
	// for registered user, not for admin nor coordinator
	var isCoordinator = req.course.coordinators.some(function(element, index, array) {
		return element.id === req.user.id;
	});
	if ((req.user.roles.indexOf('admin') === -1 && ! isCoordinator) && (req.sequence.start !== null && moment().isBefore(moment(req.sequence.start)) ||
		req.sequence.end !== null && moment().isAfter(moment(req.sequence.end)))) {
		return res.status(403).send('Sequence not accessible.');
	}
	next();
};
