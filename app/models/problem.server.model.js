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
	}]
});

mongoose.model('Problem', ProblemSchema);
