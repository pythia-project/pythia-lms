'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Sequence = mongoose.model('Sequence'),
	_ = require('lodash');

/**
 * Create a Sequence
 */
exports.create = function(req, res) {
	var sequence = new Sequence(req.body);
	sequence.user = req.user;
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
exports.sequenceByID = function(req, res, next, id) { 
	Sequence.findById(id).exec(function(err, sequence) {
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
