'use strict';

/**
 * Module dependencies
 */
var coursesPolicy = require('../policies/courses.server.policy'),
  courses = require('../controllers/courses.server.controller');

module.exports = function (app) {
  // Courses collection routes
  app.route('/api/courses').all(coursesPolicy.isAllowed)
    .get(courses.list)
    .post(courses.create);

  // Single course routes
  app.route('/api/courses/:courseSerial').all(coursesPolicy.isAllowed)
    .get(courses.read);

  // Finish by binding the course middleware
  app.param('courseSerial', courses.courseBySerial);
};
