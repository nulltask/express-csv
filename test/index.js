var express = require('express')
  , request = require('superagent')
  , csv = require('../')
  , app = express.createServer();

app.get('/test/1', function(req, res) {
  res.csv([
    ['a', 'b', 'c']
  , ['d', 'e', 'f']
  ]);
});

app.get('/test/2', function(req, res) {
  res.csv([
    [ 'a', 'b', null ]
  ]);
});

app.get('/test/3', function(req, res) {
  res.csv([
    [ 'a', 'b', undefined ]
  ]);
});

app.get('/test/objectArray', function(req, res) {
  res.csv([
    { stringProp: "a", nullProp: null, undefinedProp: undefined },
    { stringProp: "b", nullProp: null, undefinedProp: undefined }
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

  it('should expose .preventCast', function() {
    csv.preventCast.should.be.a('boolean');
  });
  
  it('should expose .ignoreNullOrUndefined', function() {
    csv.ignoreNullOrUndefined.should.be.a('boolean');
  });

  it('should extend res.csv', function() {
    if (express.version.match(/^2\.[0-9]+\.[0-9]+$/)) {
      // express 2.x
      require('http').ServerResponse.prototype.csv.should.be.a('function');
    } else {
      // express 3.x
      require('express').response.csv.should.be.a('function');
    }
  });
});

describe('res.csv()', function() {

  describe('when given an array of objects', function() {
    describe('and ignoreNullOrUndefined is true', function() {
      var rows;

      beforeEach(function(done) {
        csv.ignoreNullOrUndefined = true;
        request
          .get('http://127.0.0.1:8383/test/objectArray')
          .end(function(res) {
            rows = res.text.split("\r\n");
            done();
          });
      });

      it('should include values that exist', function() {
        rows[0].split(",")[0].should.equal('"a"');
        rows[1].split(",")[0].should.equal('"b"');
      });

      it('should exclude null', function() {
        rows[0].split(",")[1].should.equal('');
        rows[0].split(",")[2].should.equal('');
      });

      it('should exclude undefined', function() {
        rows[0].split(",")[2].should.equal('');
        rows[1].split(",")[2].should.equal('');
      });
    });

    describe('and ignoreNullOrUndefined is false', function() {
      var rows;

      beforeEach(function(done) {
        csv.ignoreNullOrUndefined = false;
        request
          .get('http://127.0.0.1:8383/test/objectArray')
          .end(function(res) {
            rows = res.text.split("\r\n");
            done();
          });
      });

      it('should include values that exist', function() {
        rows[0].split(",")[0].should.equal('"a"');
        rows[1].split(",")[0].should.equal('"b"');
      });

      it('should include null', function() {
        rows[0].split(",")[1].should.equal('"null"');
        rows[1].split(",")[1].should.equal('"null"');
      });

      it('should include undefined', function() {
        rows[0].split(",")[2].should.equal('"undefined"');
        rows[1].split(",")[2].should.equal('"undefined"');
      });
    });
  });

  it('should response csv', function(done) {
    request 
      .get('http://127.0.0.1:8383/test/1')
      .end(function(res) {
        res.text.should.equal('"a","b","c"\r\n"d","e","f"\r\n');
        done();
      });
  });

  it('should response valid content-type', function(done) {
    request
      .get('http://127.0.0.1:8383/test/1')
      .end(function(res) {
        res.headers['content-type'].should.match(/^text\/csv/);
        done();
      });
  });

  it('should response csv includes ignored null', function(done) {
    request
      .get('http://127.0.0.1:8383/test/2')
      .end(function(res) {
        res.text.should.equal('"a","b",\r\n');
        done();
      });
  });

  it('should response csv includes ignored undefined', function(done) {
    request
      .get('http://127.0.0.1:8383/test/3')
      .end(function(res) {
        res.text.should.equal('"a","b",\r\n');
        done();
      });
  });

  it('should response csv includes null', function(done) {
    var prevOption = csv.ignoreNullOrUndefined;
    csv.ignoreNullOrUndefined = false;
    request
      .get('http://127.0.0.1:8383/test/2')
      .end(function(res) {
        csv.ignoreNullOrUndefined = prevOption;
        res.text.should.equal('"a","b","null"\r\n');
        done();
      });
  });

  it('should response csv includes undefined', function(done) {
    var prevOption = csv.ignoreNullOrUndefined;
    csv.ignoreNullOrUndefined = false;
    request
      .get('http://127.0.0.1:8383/test/3')
      .end(function(res) {
        csv.ignoreNullOrUndefined = prevOption;
        res.text.should.equal('"a","b","undefined"\r\n');
        done();
      });
  });

  it('should response tsv', function(done) {
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

  it('should response quoted csv', function(done) {
    var prevSetting = csv.preventCast;
    csv.preventCast = true;
    request
      .get('http://127.0.0.1:8383/test/1')
      .end(function(res) {
        csv.preventCast = prevSetting;
        res.text.should.equal('="a",="b",="c"\r\n="d",="e",="f"\r\n');
        done();
      });
  });
});
