'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * News Schema
 */
var NewsSchema = new Schema({
	title: {
		type: String,
		required: 'Please provide a title for the news.',
		trim: true
	},
	content: {
		type: String,
		required: 'Please provide a content for the news.'
	},
	course: {
		type: Schema.ObjectId,
		ref: 'Course',
		default: null
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

mongoose.model('News', NewsSchema);
