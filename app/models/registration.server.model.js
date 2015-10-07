'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Registration Schema
 */
var RegistrationSchema = new Schema({
	course: {
		type: Schema.ObjectId,
		ref: 'Course'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	registered: {
		type: Date,
		default: Date.now
	},
	sequences: {
		type: [new Schema({
			lessons: {
				type: [new Schema({
					problems: {
						type: [new Schema({
							submissions: {
								type: [new Schema({
									status: {
										type: String
									},
									answer: {
										type: String
									},
									feedback: {
										type: {}
									},
									submitted: {
										type: Date,
										default: Date.now
									}
								}, {
									id: false,
									_id: false
								})],
								default: []
							},
							score: {
								type: Number,
								default: 0
							}
						}, {
							id: false,
							_id: false
						})],
						default: []
					},
					succeeded: {
						type: Boolean,
						default: false
					}
				}, {
					id: false,
					_id: false
				})],
				default: []
			},
			succeeded: {
				type: Boolean,
				default: false
			}
		}, {
			id: false,
			_id: false
		})],
		default: []
	}
});

mongoose.model('Registration', RegistrationSchema);
