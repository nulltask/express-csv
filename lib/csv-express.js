/*
  csv-express
  Forked and modified by John J Czaplewski <jczaplew@gmail.com>

  Copyright 2011 Seiya Konno <nulltask@gmail.com>
  MIT Licensed
 */


'use strict';

var res = require('http').ServerResponse.prototype;

// Configurable settings
exports.separator = ',';
exports.preventCast = false;
exports.ignoreNullOrUndefined = true;

/*
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


 /*
  Send CSV response

  {data} - Array objects or arrays
  {csvHeaders} - If true uses the keys of the objects in {obj} to set a header row
  {headers} - Optional response headers
  {stats} - Optional status code
 */

res.csv = function(data, csvHeaders, headers, status) {
  var body = '';

  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/csv');

  if (csvHeaders) {
    var header = [];
    for (var prop in data[0]) {
      if (data[0].hasOwnProperty(prop)) {
        header.push(prop);
      }
    }
    body += header + '\r\n';
  }

  data.forEach(function(item) {
    if (!(item instanceof Array)) {
      item = objToArray(item);
    }
    body += item.map(escape).join(exports.separator) + '\r\n';
  });

  return this.send(body, headers, status);
}
