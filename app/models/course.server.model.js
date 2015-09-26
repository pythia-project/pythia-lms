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
	serial: {
		type: String,
		required: 'Please select a serial for the course.',
		unique: 'A course with the same serial already exists.'
	},
	title: {
		type: String,
		required: 'Please select a title for the course.',
		trim: true
	},
	description: {
		type: String,
		default: ''
	},
	coordinators: {
		type: [{
			type: Schema.ObjectId,
			ref: 'User',
		}],
		default: [],
		required: 'Please choose at least one coordinator for the course.'
	},
	sequences: {
		type: [{
			type: Schema.ObjectId,
			ref: 'Sequence'
		}],
		default: []
	},
	visible: {
		type: Boolean,
		default: false
	},
	private: {
		type: Boolean,
		default: true
	},
	registrations: {
		type: [new Schema({
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
					}
				}, {
					id: false,
					_id: false
				})],
				default: []
			}
		}, {
			id: false,
			_id: false
		})],
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

mongoose.model('Course', CourseSchema);
