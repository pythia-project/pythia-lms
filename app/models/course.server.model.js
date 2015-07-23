'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Course Schema
 */
var CourseSchema = new Schema({
	title: {
		type: String,
		required: 'Please select a title for the course.',
		trim: true
	},
	description: {
		type: String,
		default: ''
	},
	coordinator: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Please choose a coordinator for the course.'
	},
	sequences: [{
		type: Schema.ObjectId,
		ref: 'Sequence'
	}],
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Course', CourseSchema);
