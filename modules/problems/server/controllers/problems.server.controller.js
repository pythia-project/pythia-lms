'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Problem = mongoose.model('Problem'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a problem
 */
exports.create = function (req, res) {
  var problem = new Problem(req.body);
  problem.user = req.user;
  problem.authors = [req.user];

  problem.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(problem);
    }
  });
};

/**
 * Show the current problem
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var problem = req.problem ? req.problem.toJSON() : {};
  res.json(problem);
};

/**
 * List of problems
 */
exports.list = function (req, res) {
  Problem.find().populate('user', 'displayName').exec(function (err, problems) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(problems);
    }
  });
};

/**
 * Problem middleware
 */
exports.problemByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Problem is invalid'
    });
  }

  Problem.findById(id).populate('user', 'displayName').exec(function (err, problem) {
    if (err) {
      return next(err);
    } else if (!problem) {
      return res.status(404).send({
        message: 'No problem with that identifier has been found'
      });
    }
    req.problem = problem;
    next();
  });
};
