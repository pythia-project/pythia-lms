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
	User.find({}, 'firstname lastname displayname username picture').exec(function(err, users) {
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
	User.findOne({'username': username}, 'firstname lastname username').exec(function(err, user) {
		if (err || ! user) {
			return errorHandler.getLoadErrorMessage(err, 'user', username, next);
		}
		req.userprofile = user;
		next();
	});
};
