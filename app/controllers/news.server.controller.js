'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	News = mongoose.model('News'),
	_ = require('lodash');

/**
 * Create a news
 */
exports.create = function(req, res) {
	var news = new News(req.body);
	news.user = req.user;
	news.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(news);
	});
};

/**
 * Show the current news
 */
exports.read = function(req, res) {
	res.jsonp(req.news);
};

/**
 * Update a news
 */
exports.update = function(req, res) {
	var news = req.news;
	news = _.extend(news, req.body);
	news.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(news);
	});
};


/**
 * List of news
 */
exports.list = function(req, res) { 
	News.find().exec(function(err, news) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(news);
	});
};

/**
 * News middleware
 */
exports.newsByID = function(req, res, next, id) {
	News.findById(id, 'title content').exec(function(err, news) {
		if (err || ! news) {
			return errorHandler.getLoadErrorMessage(err, 'news', id, next);
		}
		req.news = news;
		next();
	});
};
