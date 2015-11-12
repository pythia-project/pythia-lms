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
	var problem = new Problem(req.body);
	problem.user = req.user;
	problem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(problem);
	});
};

/**
 * Show the current problem
 */
exports.read = function(req, res) {
	res.jsonp(req.problem);
};

/**
 * Update a problem
 */
exports.update = function(req, res) {
	var problem = req.problem;
	problem = _.extend(problem, req.body);
	problem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(problem);
	});
};


/**
 * List of problems
 */
exports.list = function(req, res) { 
	Problem.find().exec(function(err, problems) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(problems);
		}
	});
};

/**
 * Problem middleware
 */
exports.problemByID = function(req, res, next, id) {
	Problem.findById(id, 'name type description authors points task config').exec(function(err, problem) {
		if (err || ! problem) {
			return errorHandler.getLoadErrorMessage(err, 'problem', id, next);
		}
		req.problem = problem;
		next();
	});
};
