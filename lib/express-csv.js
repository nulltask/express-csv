/*!
 * express-csv
 * Copyright 2011 Seiya Konno <nulltask@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , res = http.ServerResponse.prototype;

/**
 * Import package information.
 */

var package = require('../package');

/**
 * Library version.
 */

exports.version = package.version;

/**
 * CSV separator
 */

exports.separator = ',';

/**
 * Prevent Excel's casting.
 */

exports.preventCast = false;

/**
 * Escape CSV field
 *
 * @param {Mixed} field
 * @return {String}
 * @api private
 */

function escape(field) {
  if (exports.preventCast) {
    return '"="' + field.toString().replace(/\"/g, '""') + '""';
  }
  return '"' + field.toString().replace(/\"/g, '""') + '"';
}

/**
 * Send CSV response with `obj`, optional `headers`, and optional `status`.
 * 
 * @param {Array} obj
 * @param {Object|Number} headers or status
 * @param {Number} status
 * @return {ServerResponse}
 * @api public
 */

res.csv = function(obj, headers, status) {
  var body = '';

  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/csv');

  obj.forEach(function(item) {
    body += item.map(escape).join(exports.separator) + '\r\n';
  });

  return this.send(body, headers, status);
};

