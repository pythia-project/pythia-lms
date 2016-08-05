(function (app) {
  'use strict';

  app.registerModule('problems', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('problems.services');
  app.registerModule('problems.routes', ['ui.router', 'core.routes', 'problems.services']);
}(ApplicationConfiguration));
