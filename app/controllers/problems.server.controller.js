'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Problem = mongoose.model('Problem'),
	_ = require('lodash');

/**
 * Create a problem
 */
exports.create = function(req, res) {
};


/**
 * List of problems
 */
exports.list = function(req, res) { 
	Problem.find().sort('-created').populate('user', 'displayName').exec(function(err, problems) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(problems);
		}
	});
};
