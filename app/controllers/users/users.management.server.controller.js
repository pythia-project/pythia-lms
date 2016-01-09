'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	Registration = mongoose.model('Registration'),
	User = mongoose.model('User'),
	async = require('async');

/**
 * Show the current user
 */
exports.read = function(req, res) {
  Registration.find({'user': req.userprofile._id}).populate('course', 'serial title').exec(function(err, registration) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    //Need to convert from mongoose object to json to add a new attribute
    req.userprofile = req.userprofile.toObject();
    req.userprofile.courses = registration;
    res.jsonp(req.userprofile);
  });
};

/**
 * Delete a user
 */
exports.delete = function(req, res) {
	async.waterfall([
		// Find and delete registration, if any
		function(done) {
			Registration.find({'user': req.userprofile}).exec(function(err, registration) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				if (registration.length > 0) {
					registration[0].remove(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						}
						done(err);
					});
				} else {
					done(err);
				}
			});
		},
		// Delete the user
		function(done) {
			req.userprofile.remove(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				res.jsonp(req.userprofile);
				done(err);
			});
		}
	], function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
	});
};

/**
 * List of users
 */
exports.list = function(req, res) {
	User.find({}, 'firstname lastname displayname username picture active').exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(users);
	});
};

/**
 * User middleware
 */
exports.userByUsername = function(req, res, next, username) {
	User.findOne({'username': username}, 'email firstname lastname username roles picture active').exec(function(err, user) {
		if (err || ! user) {
			return errorHandler.getLoadErrorMessage(err, 'user', username, next);
		}
		req.userprofile = user;
		next();
	});
};

/**
 * Switch the active status of a user
 */
exports.switchActive = function(req, res, next) {
	var username = req.userprofile.username;
	User.findOne({'username': username}, 'username active').exec(function(err, user) {
		if (err || ! user) {
			return errorHandler.getLoadErrorMessage(err, 'user', username, next);
		}
		user.active = ! user.active;
		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			res.jsonp({
				'active': user.active
			});
		});
	});
};