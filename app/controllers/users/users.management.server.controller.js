'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');


/**
 * Show the current user
 */
exports.read = function(req, res) {
	res.jsonp(req.userprofile);
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
