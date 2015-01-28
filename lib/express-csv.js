/*!
 * express-csv
 * Copyright 2011 Seiya Konno <nulltask@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , express = require('express')
  , res = express.response || http.ServerResponse.prototype;

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
 * Ignore `null` or `undefined`
 */

exports.ignoreNullOrUndefined = true;

/**
 * Escape CSV field
 *
 * @param {Mixed} field
 * @return {String}
 * @api private
 */

function escape(field) {
  if (exports.ignoreNullOrUndefined && field == undefined) {
    return '';
  }
  if (exports.preventCast) {
    return '="' + String(field).replace(/\"/g, '""') + '"';
  }
  if (!isNaN(parseFloat(field)) && isFinite(field)) {
    return parseFloat(field);
  }
  return '"' + String(field).replace(/\"/g, '""') + '"';
}

/**
 * Convert an object to an array of property values.
 *
 * Example:
 *    objToArray({ name: "john", id: 1 })
 *    // => [ "john", 1 ]
 *
 * @param {Object} obj The object to convert.
 * @return {Array} The array of object properties.
 * @api private
 */

function objToArray(obj) {
  var result = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result.push(obj[prop]);
    }
  }
  return result;
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

res.csv = function(obj, csvHeaders, headers, status) {
  var body = '';

  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/csv');

  if (csvHeaders) {
    var header = [];
    for (var prop in obj[0]) {
      if (obj[0].hasOwnProperty(prop)) {
        header.push(prop);
      }
    }
    body += header + '\r\n';
  }

  obj.forEach(function(item) {
    if (!(item instanceof Array)) item = objToArray(item);
    body += item.map(escape).join(exports.separator) + '\r\n';
  });

  return this.send(body, headers, status);
};

