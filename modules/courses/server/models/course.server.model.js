'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Course Schema
 */
var CourseSchema = new Schema({
  serial: {
    type: String,
    required: 'Please fill in a serial.',
    unique: 'A course with the same serial already exists.'
  },
  title: {
    type: String,
    required: 'Please fill in a title.',
    trim: true
  },
  credits: {
    type: Number,
    required: 'Please fill in the number of credits.'
  },
  coordinators: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    required: 'Please fill in at least one coordinator.'
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
