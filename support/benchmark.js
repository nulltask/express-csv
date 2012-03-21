#!/usr/bin/env node

var express = require('express')
  , request = require('superagent')
  , csv = require('../')
  , app = express.createServer()
  , data = [];

for (var i = 0; i < 1000; ++i) {
  var record = [];
  for (var j = 0; j < 100; ++j) {
    record.push(j);
  }
  data.push(record);
}

app.get('/', function(req, res) {
  res.csv(data);
});

app.listen(8383);

function benchmark(time) {
  var now = new Date();

  for (var i = 0, len = time; i < len; ++i) {
    request
      .get('http://127.0.0.1:8383/')
      .end(function() {
        --time || !function() {
          console.log('- result: %dms elapsed.', new Date() - now);
          process.exit(0);
        }();
      });
  }
}

benchmark(100);