'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Course = mongoose.model('Course'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a course
 */
exports.create = function (req, res) {
  var course = new Course(req.body);
  course.user = req.user;
  course.coordinators = [req.user];

  course.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(course);
    }
  });
};

/**
 * Show the current course
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var course = req.course ? req.course.toJSON() : {};
  res.json(course);
};


/**
 * List of courses
 */
exports.list = function (req, res) {
  Course.find().populate('user', 'displayName').exec(function (err, courses) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(courses);
    }
  });
};

/**
 * Course middleware
 */
exports.courseBySerial = function (req, res, next, serial) {

  Course.findOne({ 'serial': serial }).populate('user', 'displayName').populate('coordinators', 'displayName').exec(function (err, course) {
    if (err) {
      return next(err);
    } else if (!course) {
      return res.status(404).send({
        message: 'No course with that serial has been found'
      });
    }
    console.log('!!! COURSE : ' + req.course);
    req.course = course;
    next();
  });
};
