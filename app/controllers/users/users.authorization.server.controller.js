'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (! req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in.'
		});
	}
	next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;
	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			}
			return res.status(403).send({
				message: 'User is not authorized.'
			});
		});
	};
};
