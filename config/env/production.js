'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/pythia-lms',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
				'public/lib/ng-tags-input/ng-tags-input.min.css',
				'public/lib/ng-tags-input/ng-tags-input.bootstrap.min.css',
				'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
				'public/lib/nya-bootstrap-select/dist/css/nya-bs-select.min.css',
				'public/lib/CodeMirror/lib/codemirror.css',
				'public/lib/CodeMirror/theme/neo.css'
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/CodeMirror/lib/codemirror.js',
				'public/lib/CodeMirror/mode/clike/clike.js',
				'public/lib/CodeMirror/mode/python/python.js',
				'public/lib/angular-cookies/angular-cookies.min.js',
				'public/lib/angular-mocks/angular-mocks.js',
				'public/lib/moment/min/moment.min.js',
				'public/lib/angular-moment/angular-moment.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-sanitize/angular-sanitize.min.js',
				'public/lib/angular-touch/angular-touch.min.js',
				'public/lib/angular-ui-event/dist/event.min.js',
				'public/lib/angular-ui-indeterminate/dist/indeterminate.min.js',
				'public/lib/angular-ui-mask/dist/mask.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-scroll/dist/ui-scroll.min.js',
				'public/lib/angular-ui-scrollpoint/dist/scrollpoint.min.js',
				'public/lib/angular-ui-uploader/dist/uploader.min.js',
				'public/lib/angular-ui-validate/dist/validate.min.js',
				'public/lib/angular-ui-utils/index.js',
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/ng-tags-input/ng-tags-input.min.js',
				'public/lib/nya-bootstrap-select/dist/js/nya-bs-select.min.js',
				'public/lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
				'public/lib/bootstrap/dist/js/bootstrap.min.js',
				'public/lib/CodeMirror/addon/selection/active-line.js',
				'public/lib/angular-ui-codemirror/ui-codemirror.min.js',
				'public/lib/angular-bind-html-compile/angular-bind-html-compile.js',
				'public/lib/angular-translate/angular-translate.min.js',
				'public/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
				'public/lib/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
				'public/lib/angular-translate-storage-local/angular-translate-storage-local.min.js'
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
