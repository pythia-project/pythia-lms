'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/pythia-lms',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/ng-tags-input/ng-tags-input.css',
				'public/lib/ng-tags-input/ng-tags-input.bootstrap.css',
				'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
				'public/lib/CodeMirror/lib/codemirror.css',
				'public/lib/CodeMirror/theme/neo.css'
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/CodeMirror/lib/codemirror.js',
				'public/lib/CodeMirror/mode/python/python.js',
				'public/lib/angular-cookies/angular-cookies.js',
				'public/lib/angular-mocks/angular-mocks.js',
				'public/lib/moment/moment.js',
				'public/lib/angular-moment/angular-moment.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-sanitize/angular-sanitize.js',
				'public/lib/angular-touch/angular-touch.js',
				'public/lib/angular-ui-event/dist/event.js',
				'public/lib/angular-ui-indeterminate/dist/indeterminate.js',
				'public/lib/angular-ui-mask/dist/mask.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-scroll/dist/ui-scroll.js',
				'public/lib/angular-ui-scrollpoint/dist/scrollpoint.js',
				'public/lib/angular-ui-uploader/dist/uploader.js',
				'public/lib/angular-ui-validate/dist/validate.js',
				'public/lib/angular-ui-utils/index.js',
				'public/lib/jquery/dist/jquery.js',
				'public/lib/ng-tags-input/ng-tags-input.js',
				'public/lib/bootstrap/dist/js/bootstrap.js',
				'public/lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
				'public/lib/CodeMirror/addon/selection/active-line.js',
				'public/lib/angular-ui-codemirror/ui-codemirror.js',
				'public/lib/angular-bind-html-compile/angular-bind-html-compile.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
