(function (app) {
  'use strict';

  app.registerModule('courses', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('courses.services');
  app.registerModule('courses.routes', ['ui.router', 'core.routes', 'courses.services']);
}(ApplicationConfiguration));
