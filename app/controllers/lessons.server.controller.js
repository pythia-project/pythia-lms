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
	Problem = mongoose.model('Problem'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a lesson
 */
exports.create = function(req, res) {
	// Check course
	var courseSerial = req.body.courseSerial;
	Course.findOne({'serial': courseSerial}, 'serial sequences').populate('sequences', 'lessons').exec(function(err, course) {
		if (err || ! course) {
			return res.status(400).send({
				message: errorHandler.getLoadErrorMessage(err, 'course', courseSerial)
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
	Lesson.findById({'_id': req.sequence.lessons[index - 1]._id}, 'name start end context problems user').populate('problems', 'name description points authors').exec(function(err, lesson) {
		if (err || ! lesson) {
			return errorHandler.getLoadErrorMessage(err, 'lesson', index + ' of sequence ' + req.sequence.name + ' of course ' + req.course.serial, next);
		}
		req.lesson = lesson;
		next();
	});
};

/**
 * Problem middleware
 */
exports.problemByIndex = function(req, res, next, index) {
	Problem.findById({'_id': req.lesson.problems[index - 1]._id}, 'name').exec(function(err, problem) {
		if (err || ! problem) {
			return errorHandler.getLoadErrorMessage(err, 'problem', index + ' of lesson ' + req.lesson.name + ' of sequence ' + req.sequence.name + ' of course ' + req.course.serial, next);
		}
		req.problem = problem;
		next();
	});
};

/*
 * Submit a problem
 */
var getProblem = function(registrations, course, sequenceIndex, lessonIndex, problemIndex) {
	var registration = null;
	for (var i = 0; i < registrations.length; i++) {
		registration = registrations[i];
		if (registration.course.toString() === course._id) {
			break;
		}
	}
	// Get the sequence
	while (registration.sequences.length < sequenceIndex) {
		registration.sequences.push([]);
	}
	var sequence = registration.sequences[sequenceIndex - 1];
	// Get the lesson
	while (sequence.lessons.length < lessonIndex) {
		sequence.lessons.push([]);
	}
	var lesson = sequence.lessons[lessonIndex - 1];
	// Get the problem
	while (lesson.problems.length < problemIndex) {
		lesson.problems.push([]);
	}
	return lesson.problems[problemIndex - 1];
};
exports.submit = function(req, res) {
	// Check course
	var courseSerial = req.params.courseSerial;
	Course.findOne({'serial': courseSerial}, '_id sequences').populate('sequences', 'lessons').exec(function(err, course) {
		if (err || ! course) {
			return res.status(400).send({
				message: errorHandler.getLoadErrorMessage(err, 'course', courseSerial)
			});
		}
		// Load the lesson
		var lessonId = course.sequences[req.params.sequenceIndex - 1].lessons[req.params.lessonIndex - 1];
		Lesson.findById({'_id': lessonId}).exec(function(err, lesson) {
			if (err || ! lesson) {
				return res.status(400).send({
					message: errorHandler.getLoadErrorMessage(err, 'lesson', lessonId)
				});
			}
			// Load the problem
			var problemId = lesson.problems[req.params.problemIndex - 1];
			Problem.findById({'_id': problemId}, 'task').exec(function(err, problem) {
				if (err || ! problem) {
					return res.status(400).send({
						message: errorHandler.getLoadErrorMessage(err, 'problem', problemId)
					});
				}
				// Trying to reach Pythia queue
				var status = 'failed';
				var message = '<p>An error occurred during the grading of your submission, please try again later.</p>';
				var data = '';
				var submissions = [];
				var socket = new net.Socket();
				socket.setEncoding('utf8');
				socket.on('connect', function() {
					socket.write(JSON.stringify({
						'message': 'launch',
						'id': 'test',
						'task': problem.task,
						'input': JSON.stringify({
							'tid': 'task1',
							'fields': JSON.parse(req.body.input)
						})
					}));
				});
				socket.on('data', function(chunk) {
					data += chunk;
					try {
						// Get and analyse result provided by Pythia
						var result = JSON.parse(data);
						var output = JSON.parse(result.output);
						if (result.status === 'success') {
							status = output.status;
						}
						if (output.feedback.message !== undefined) {
							message = output.feedback.message;						
						} else if (output.feedback.example !== undefined) {
							message = '<p>Your code did not produced the good result.</p><ul>' +
								'<li>Expected result: ' + output.feedback.example.expected + '</li>' +
								'<li>Your result: ' + output.feedback.example.actual + '</li>' +
							'</ul>';
						}
						// Save submission in user
						// Get registration for this course
						User.findById(req.user._id, function(err, user) {
							// Get the problem
							var problem = getProblem(user.registrations, course, req.params.sequenceIndex, req.params.lessonIndex, req.params.problemIndex);
							problem.submissions.push({
								answer: req.body.input,
								feedback: output.feedback
							});
							// Save submission in database
							user.save(function(err) {
								if (err) {
									console.log(err);
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								}
								submissions = problem.submissions;
								socket.destroy();
							});
						});
					} catch (err) {
						console.log(err);
					}
				});
				socket.on('close', function(had_error) {
					res.jsonp({
						'status': had_error ? 'error' : status,
						'message': message,
						'submissions': submissions
					});
				});
				socket.on('error', function(err) {
					switch (err.errno) {
						case 'ECONNREFUSED':
							message = 'The grading server is not reachable, please try again later.';
						break;
					}
				});
				socket.connect(9000, '127.0.0.1');
			});
		});
	});
};
