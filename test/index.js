var express = require('express')
  , request = require('superagent')
  , csv = require('../')
  , app = express.createServer();

app.get('/test/1', function(req, res) {
  res.csv([
  , ['a', 'b', 'c']
  , ['d', 'e', 'f']
  ]);
});

app.listen(8383);

describe('express-csv', function() {
  it('should expose .version', function() {
    csv.version.should.be.match(/[0-9]+\.[0-9]+\.[0-9]+/);
  });

  it('should expose .separator', function() {
    csv.separator.should.be.a('string');
  });
  
  it('should extend http.ServerResponse.prototype.csv', function() {
    require('http').ServerResponse.prototype.csv.should.be.a('function');
  });

  it('should return csv', function(done) {
    request 
      .get('http://127.0.0.1:8383/test/1')
      .end(function(res) {
        res.text.should.equal('"a","b","c"\r\n"d","e","f"\r\n');
        done();
      });
  });

  it('should return tsv', function(done) {
    var prevSeparator = csv.separator;
    csv.separator = '\t';
    request
      .get('http://127.0.0.1:8383/test/1')
      .end(function(res) {
        csv.separator = prevSeparator;
        res.text.should.equal('"a"\t"b"\t"c"\r\n"d"\t"e"\t"f"\r\n');
        done();
      });
  });
});
