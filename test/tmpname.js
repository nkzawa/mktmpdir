var expect = require('chai').expect
  , fs = require('fs')
  , os = require('os')
  , tmpname = require('../lib/tmpname');


function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

describe('tmpname', function() {
  describe('makeTmpname', function() {
    it('should create a random name', function(done) {
      expect(tmpname.makeTmpname('foo')).to.not.equal(tmpname.makeTmpname('foo'));
      done();
    });

    it('should add a prefix', function(done) {
      expect(tmpname.makeTmpname('foo')).to.match(/^foo[0-9]{8}-[0-9]+-[a-z0-9]+$/);
      done();
    });

    it('should add a prefix and suffix', function(done) {
      expect(tmpname.makeTmpname(['foo', 'bar'])).to.match(/^foo[0-9]{8}-[0-9]+-[a-z0-9]+bar$/);
      done();
    });

    it('should have the current date and the process id within the name', function(done) {
      var m = tmpname.makeTmpname('foo').match(/^foo([0-9]{8})-([0-9]+)-[a-z0-9]+$/);
      var t = new Date().toISOString().split('T')[0].split('-').join('');
      expect(m[1]).to.equal(t);
      expect(m[2]).to.equal('' + process.pid);
      done();
    });

    it('should throw an error when "prefixSuffix" is not a string or array', function(done) {
      expect(function() {
        tmpname.makeTmpname();
      }).to.throw(Error);
      done();
    });
  });

  describe('create', function() {
    it('should call "creator" and "callback" with the path value', function(done) {
      var _path
      tmpname.create('d', null, function(err, path, done) {
        _path = path;
        expect(err).to.not.exist;
        expect(path).to.match(new RegExp('^' + escapeRegExp(os.tmpDir().replace(/\/$/, '')) + '/d[0-9]{8}-[0-9]+-[a-z0-9]+$'));
        done();
      }, function(err, path) {
        expect(err).to.not.exist;
        expect(path).to.equal(_path);
        done();
      });
    });

    it('should take "tmpdir"', function(done) {
      tmpname.create('d', '/foo', function(err, path, done) {
        expect(err).to.not.exist;
        expect(path).to.match(new RegExp('^/foo/d[0-9]{8}-[0-9]+-[a-z0-9]+$'));
        done();
      }, done);
    });

    it('should be an error when "prefixSuffix" is not a string or array', function(done) {
      tmpname.create(null, null, function(err, path, _done) {
        expect(err).to.be.an.instanceof(Error);
        expect(path).to.not.exist;
        expect(_done).to.not.exist;
        done();
      });
    });

    it('should pass an error', function(done) {
      tmpname.create('d', null, function(err, path, done) {
        done(new Error('woot'));
      }, function(err, path) {
        expect(err).to.be.an.instanceof(Error);
        expect(err).to.have.property('message', 'woot');
        done();
      });
    });

    it('should retry when the directory already exists', function(done) {
      var called = 0;
      var paths = {};

      function creator(err, path, done) {
        called++;
        paths[path] = null;

        if (called < 3) {
          // make the "EEXIST" error
          fs.mkdir(os.tmpDir(), done);
          return;
        }
        done();
      }

      tmpname.create('d', null, creator, function(err, path) {
        expect(called).to.equal(3);
        expect(Object.keys(paths)).to.have.length(3);
        done();
      });
    });
  });
});
