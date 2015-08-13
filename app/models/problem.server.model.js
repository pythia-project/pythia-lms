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
		type: String
	},
	description: {
		type: String
	},
	authors: [{
		type: String
	}],
	tasks: {
		environment: {
			type: String,
		},
		taskfs: {
			type: String,
		},
		limits: {
			time: {
				type: Number,
			},
			memory: {
				type: Number,
			},
			disk: {
				type: Number,
			},
			output: {
				type: Number,
			}
		}
	}
});

mongoose.model('Problem', ProblemSchema);
