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
	Registration = mongoose.model('Registration'),
	_ = require('lodash'),
	moment = require('moment');

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
			'context': req.body.context,
			'problems': req.body.problems
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
	Lesson.findById({'_id': req.sequence.lessons[index - 1]._id}, 'name start end context problems user').populate('problems', 'name description points authors maxsubmission').exec(function(err, lesson) {
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

/**
 * Sequence authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// Authorized lesson if current date between start and end date
	// for registered user, not for admin nor coordinator
	var isCoordinator = req.course.coordinators.some(function(element, index, array) {
		return element.id === req.user.id;
	});
	if ((req.user.roles.indexOf('admin') === -1 && ! isCoordinator) && (req.lesson.start !== null && moment().isBefore(moment(req.lesson.start)) ||
		req.lesson.end !== null && moment().isAfter(moment(req.lesson.end)))) {
		return res.status(403).send('Lesson not accessible.');
	}
	next();
};

/*
 * Submit a problem
 */
var getRegistration = function(registration, course, sequenceIndex, lessonIndex, problemIndex) {
	// Fill the registration object if necessary
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
	return registration;
};
var genVariableValues = function(config, value, field) {
	var message = value;
	if (config !== null && config[field] !== undefined) {
		var input = [value.trim()];
		if (input[0].charAt(0) === '(' && input[0].charAt(input[0].length - 1) === ')') {
			input = input[0].substr(1, input[0].length - 2).split(',');
		}
		message = '<table class="table table-bordered table-condensed">';
		for (var i = 0; i < config[field].length; i++) {
			message += '<tr class="active"><td style="width: 100px;"><code>' + config[field][i].name + '</code></td><td><code>' + input[i] + '</code></td></tr>';
		}
		message += '</table>';
	}
	return message;
};
var generateFeedback = function(problem, result, output) {
	var message = '';
	// Get the default message, if any
	if (output.feedback.message !== undefined) {
		message = output.feedback.message;
	}
	// Check the status of the submission
	if (result.status === 'success') {
		switch (output.status) {
			case 'success':
				message = '<p><span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span> {{\'FEEDBACK.SUCCESS\' | translate}}</p>';
			break;

			case 'failed':
				message = '<p><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span> {{\'FEEDBACK.FAIL\' | translate}}</p>';
			break;
		}
	}
	// Check any quality message
	if (result.status === 'success' && output.status === 'success') {
		var quality = output.feedback.quality;
		if (quality !== undefined && quality.message !== undefined) {
			message = '<p><span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span> {{\'FEEDBACK.SUCCESS_IMPROVE\' | translate}}</p>';
			message += quality.message;
		}
	}
	// Load problem configuration if any
	var config = null;
	if (problem.config !== '') {
		config = JSON.parse(problem.config);
	}
	// Build the feedback message according to problem type
	switch (problem.type) {
		case 'generic':
			if (output.feedback.message !== undefined) {
				message = '<p><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span> ' + output.feedback.message + '</p>';
			}
		break;

		case 'unit-testing':
			if (output.feedback.example !== undefined) {
				message = '<p><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span> {{\'FEEDBACK.WRONG_RESULT\' | translate}}</p>';
				if (output.feedback.example.input !== undefined) {
					message += '<p><b>{{\'FEEDBACK.INPUT\' | translate}}:</b></p>' + genVariableValues(config, output.feedback.example.input, 'input');
				}
				message += '<p><b>{{\'FEEDBACK.YOUR_RESULT\' | translate}}:</b></p>' + genVariableValues(config, output.feedback.example.actual, 'result');
				message += '<p><b>{{\'FEEDBACK.EXPECTED_RESULT\' | translate}}:</b></p>' + genVariableValues(config, output.feedback.example.expected, 'result');
			}
			// Add specific message, if any
			if (output.feedback.message !== undefined) {
				message += '<p><b>{{\'FEEDBACK.HINT\' | translate}}</b>: <i>' + output.feedback.message + '</i></p>';
			} 
		break;
	}
	return message;
};
var updateScore = function(req, registration, course, lesson, score, status) {
	var sequenceReg = registration.sequences[req.params.sequenceIndex - 1];
	var lessonReg = sequenceReg.lessons[req.params.lessonIndex - 1];
	var problemReg = lessonReg.problems[req.params.problemIndex - 1];
	// For the problem
	problemReg.score = score;
	problemReg.succeeded = status === 'success';
	// For the lesson
	lessonReg.score = 0;
	lessonReg.progress = 0;
	for (var i = 0; i < lessonReg.problems.length; i++) {
		var s = lessonReg.problems[i].submissions;
		var success = ! (s.length === 0 || s[s.length - 1].status !== 'success');
		lessonReg.score += lessonReg.problems[i].score;
		if (success) {
			lessonReg.progress++;
		}
	}
	var nbProblems = lesson.problems.length;
	lessonReg.succeeded = lessonReg.progress === nbProblems;
	lessonReg.progress /= nbProblems;
	// For the sequence
	sequenceReg.score = 0;
	sequenceReg.progress = 0;
	for (var j = 0; j < sequenceReg.lessons.length; j++) {
		sequenceReg.score += sequenceReg.lessons[j].score;
		if (sequenceReg.lessons[j].succeeded) {
			sequenceReg.progress++;
		}
	}
	var nbLessons = course.sequences[req.params.sequenceIndex - 1].lessons.length;
	sequenceReg.succeeded = sequenceReg.progress === nbLessons;
	sequenceReg.progress /= nbLessons;
	// For the course
	registration.score = 0;
	registration.progress = 0;
	for (var k = 0; k < registration.sequences.length; k++) {
		registration.score += registration.sequences[k].score;
		if (registration.sequences[k].succeeded) {
			registration.progress++;
		}
	}
	var nbSequences = course.sequences.length;
	registration.progress /= nbSequences;
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
		Lesson.findById({'_id': lessonId}, 'problems').exec(function(err, lesson) {
			if (err || ! lesson) {
				return res.status(400).send({
					message: errorHandler.getLoadErrorMessage(err, 'lesson', lessonId)
				});
			}
			// Load the problem
			var problemId = lesson.problems[req.params.problemIndex - 1];
			Problem.findById({'_id': problemId}, 'points task type maxsubmission config').exec(function(err, problem) {
				if (err || ! problem) {
					return res.status(400).send({
						message: errorHandler.getLoadErrorMessage(err, 'problem', problemId)
					});
				}
				// Get registration for this course
				Registration.findOne({'course': course.id, 'user': req.user.id}, function(err, registration) {
					registration = getRegistration(registration, course, req.params.sequenceIndex, req.params.lessonIndex, req.params.problemIndex);
					var submissions = registration.sequences[req.params.sequenceIndex - 1].lessons[req.params.lessonIndex - 1].problems[req.params.problemIndex - 1].submissions;
					// Check if maximal number of submissions has been reached
					if (problem.maxsubmission !== 0 && submissions.length >= problem.maxsubmission) {
						res.jsonp({
							'status': 'error',
							'message': '<p>Maximal number of submissions reached, you cannot make any more submission.</p>',
							'registration': registration,
							'score': 0
						});
					} else {
						// Trying to reach Pythia queue
						var status = 'failed';
						var message = '<p>An error occurred during the grading of your submission, please try again later.</p>';
						var data = '';
						var newregistration = null;
						var socket = new net.Socket();
						var score = 0;
						socket.setEncoding('utf8');
						// On connexion, send the request to the Pythia grader
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
						// On data reception, if complete JSON object, handle it
						socket.on('data', function(chunk) {
							data += chunk;
							try {
								// Get and analyse result provided by Pythia
								var result = JSON.parse(data);
								var output = null;
								// Check the nature of the message
								switch (result.message) {
									case 'done':
										// Check the status of the execution performed by Pythia
										switch (result.status) {
											case 'success':
												output = JSON.parse(result.output);
												status = output.status;
												// Get the score, if any
												if (output.feedback.score !== undefined) {
													score = Math.round(output.feedback.score * problem.points);
													var quality = output.feedback.quality;
													if (quality !== undefined) {
														score = parseInt(score * quality.weight);
													}
												}
												// Build the feedback message
												message = generateFeedback(problem, result, output);
											break;

											case 'timeout':
												status = 'timeout';
												score = 0;
												message = '<p><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span> {{\'FEEDBACK.TIMEOUT\' | translate}}</p>';
											break;
										}
										// Save submission in user
										registration.sequences[req.params.sequenceIndex - 1].lessons[req.params.lessonIndex - 1].problems[req.params.problemIndex - 1].submissions.push({
											'status': status,
											'answer': req.body.input,
											'feedback': {
												'message': message,
												'raw': output !== null ? output.feedback : message
											}
										});
										// Update the score and success status
										updateScore(req, registration, course, lesson, score, status);
										registration.save(function(err) {
											if (err) {
												return res.status(400).send({
													message: errorHandler.getErrorMessage(err)
												});
											}
											newregistration = registration;
											socket.destroy();
										});
									break;

									case 'keep-alive':
										data = '';
									break;
								}
							} catch (err) {
								console.log('Pythia error: ' + err);
								console.log('Current data: ' + data);
							}
						});
						// On close, send back answer to the client
						socket.on('close', function(had_error) {
							res.jsonp({
								'status': had_error ? 'error' : status,
								'message': message,
								'registration': newregistration,
								'score': score
							});
						});
						// On error, generate an error message
						socket.on('error', function(err) {
							switch (err.errno) {
								case 'ECONNREFUSED':
									message = 'The grading server is not reachable, please try again later.';
								break;
							}
						});
						socket.connect(9000, '127.0.0.1');
					}
				});
			});
		});
	});
};

/**
 * Get all the registrations to a course
 */
exports.getRegistrations = function(req, res) {
	Registration.find({'course': req.course}, 'user sequences').populate('user', 'firstname lastname').exec(function(err, registrations) {
		if (err) {
			return errorHandler.getLoadErrorMessage(err, 'registration', 'for course ' + req.course.id);
		}
		var problemstats = [];
		for (var i = 0; i < registrations.length; i++) {
			if (req.params.sequenceIndex - 1 < registrations[i].sequences.length) {
				var sequence = registrations[i].sequences[req.params.sequenceIndex - 1];
				if (req.params.lessonIndex - 1 < sequence.lessons.length) {
					var lesson = sequence.lessons[req.params.lessonIndex - 1];
					problemstats.push({
						'user': registrations[i].user,
						'problems': lesson.problems
					});
				}
			}
		}
		res.jsonp({
			'problemstats': problemstats,
			'lesson': req.lesson
		});
	});
};
