'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Sequence Schema
 */
var SequenceSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please select a name for the sequence.',
		trim: true
	},
	description: {
		type: String,
		default: ''
	},
	start: {
		type: Date,
		default: null
	},
	end: {
		type: Date,
		default: null
	},
	lessons: {
		type: [{
			type: Schema.ObjectId,
			ref: 'Lesson'
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

mongoose.model('Sequence', SequenceSchema);
