'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Lesson schema
 */
var LessonSchema = new Schema({
	name: {
		type: String,
		required: 'Please select a name for the lesson.',
		trim: true
	},
	context: {
		type: String,
		required: 'Please enter a context for the lesson.'
	},
	problems: {
		type: [{
			type: Schema.ObjectId,
			ref: 'Problem'
		}],
		default: []
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Lesson', LessonSchema);
