'use strict';

/**
 * Module dependencies
 */
var problemsPolicy = require('../policies/problems.server.policy'),
  problems = require('../controllers/problems.server.controller');

module.exports = function (app) {
  // Problems collection routes
  app.route('/api/problems').all(problemsPolicy.isAllowed)
    .get(problems.list)
    .post(problems.create);

  // Single problem routes
  app.route('/api/problems/:problemId').all(problemsPolicy.isAllowed)
    .get(problems.read);

  // Finish by binding the problem middleware
  app.param('problemId', problems.problemByID);
};
