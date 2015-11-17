'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Problem Schema
 */
var ProblemSchema = new Schema({
	name: {
		type: String,
		required: 'Please select a name for the problem.',
		trim: true
	},
	description: {
		type: String,
		required: 'Please select a description for the problem.'
	},
	authors: {
		type: [{
			type: String
		}],
		required: 'Please choose at least one author for the problem.'
	},
	points : {
		type: Number,
		default: 0
	},
	type: {
		type: String,
		enum: ['generic', 'unit-testing', 'qcm'],
		default: 'generic'
	},
	config: {
		type: String,
		default: ''
	},
	maxsubmission: {
		type: Number,
		default: 0
	},
	task: {
		environment: {
			type: String,
			required: 'Please select an environment for the problem.'
		},
		taskfs: {
			type: String,
			required: 'Please select a taskfs for the problem.'
		},
		limits: {
			time: {
				type: Number,
				default: 60
			},
			memory: {
				type: Number,
				default: 32
			},
			disk: {
				type: Number,
				default: 50
			},
			output: {
				type: Number,
				default: 1024
			}
		}
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

mongoose.model('Problem', ProblemSchema);
