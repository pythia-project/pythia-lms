'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Problem Schema
 */
var ProblemSchema = new Schema({
  name: {
    type: String,
    required: 'Please fill in a name.',
    trim: true
  },
  type: {
    type: String,
    enum: ['generic', 'unit-testing', 'qcm'],
    default: 'generic'
  },
  authors: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    required: 'Please fill in at least one author.'
  },
  description: {
    type: String,
    required: 'Please fill in a description.',
    trim: true
  },
  points: {
    type: Number,
    default: 0
  },
  maxsubmissions: {
    type: Number,
    default: 0
  },
  config: {
    type: Schema.Types.Mixed
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
