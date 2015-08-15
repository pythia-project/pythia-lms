'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	net = require('net'),
	Course = mongoose.model('Course'),
	Sequence = mongoose.model('Sequence'),
	Lesson = mongoose.model('Lesson'),
	_ = require('lodash');

/**
 * Create a lesson
 */
exports.create = function(req, res) {
	// Check course
	var courseSerial = req.body.courseSerial;
	Course.findOne({'serial': courseSerial}, 'serial sequences').populate('sequences', 'lessons').exec(function(err, course) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (! course) {
			return res.status(400).send({
				message: 'Failed to load course ' + courseSerial
			});
		}
		var sequence = course.sequences[req.body.sequenceIndex - 1];
		var lesson = new Lesson({
			'name': req.body.name,
			'start': req.body.start,
			'end': req.body.end,
			'context': req.body.context
		});
		lesson.user = req.user;
		lesson.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			// Add the lesson to the sequence
			sequence.lessons.push(lesson);
			sequence.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				res.jsonp({
					'lessonIndex': sequence.lessons.length
				});
			});
		});
	});
};

/**
 * Show the current Lesson
 */
exports.read = function(req, res) {
	res.jsonp(req.lesson);
};

/**
 * Update a lesson
 */
exports.update = function(req, res) {
	var lesson = req.lesson;
	lesson = _.extend(lesson, req.body);
	lesson.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.jsonp(lesson);
	});
};

/**
 * Delete a lesson
 */
exports.delete = function(req, res) {
	var lesson = req.lesson ;

	lesson.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(lesson);
		}
	});
};

/**
 * List of lessons
 */
exports.list = function(req, res) { 
	Lesson.find().sort('-created').populate('user', 'displayName').exec(function(err, lessons) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(lessons);
		}
	});
};

/**
 * Lesson middleware
 */
exports.lessonByIndex = function(req, res, next, index) { 
	Lesson.findById({'_id': req.sequence.lessons[index - 1]._id}, 'name start end context problems user').populate('problems', 'name description').exec(function(err, lesson) {
		if (err) {
			return next(err);
		}
		if (! lesson) {
			return next(new Error('Failed to load lesson ' + index + ' of sequence ' + req.sequence.name + ' of course ' + req.course.serial));
		}
		req.lesson = lesson;
		next();
	});
};

/*
 * Submit a problem
 */
exports.submit = function(req, res) {
	console.log('Submission of a problem...');
	// Trying to reach Pythia queue
	var client = net.createConnection(9000, '127.0.0.1');
	client.on('connect', function() {
		console.log('Connected!');
		client.destroy();
	});
	client.on('close', function(had_error) {
		console.log('Connexion closed!');
		if (! had_error) {
			res.jsonp({
				'status': 'success'
			});
		}
	});
	client.on('error', function(err) {
		console.log('Error: ');
		console.log(err);
		var message = 'An error occurred during the grading of your submission, please try again later.';
		res.jsonp({
			'status': 'error',
			'message': message
		});
	});
};
