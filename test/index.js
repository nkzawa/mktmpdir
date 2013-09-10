var expect = require('chai').expect
  , os = require('os')
  , fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , rimraf = require('rimraf')
  , mktmpdir = require('../');


function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

describe('mktmpdir', function() {
  it('should create a tmp directory and tear down it', function(done) {
    mktmpdir(function(err, dir, done) {
      expect(err).to.not.exist;
      expect(dir).to.match(new RegExp('^' + escapeRegExp(os.tmpDir().replace(/\/$/, '')) + '/d[0-9]{8}-[0-9]+-[a-z0-9]+$'));
      expect(fs.existsSync(dir)).to.be.true;
      done();
    }, function(err, dir) {
      expect(fs.existsSync(dir)).to.be.false;
      done(err);
    });
  });

  it('should create a tmp directory with mode 0700', function(done) {
    mktmpdir(function(err, dir, done) {
      var stat = fs.statSync(dir);
      var mode = '0' + (stat.mode & 0777).toString(8);
      expect(mode).to.equal('0700');
      done();
    }, done);
  });

  it('should remove the tmp directory even if it has an error', function(done) {
    mktmpdir(function(err, dir, done) {
      expect(fs.existsSync(dir)).to.be.true;
      done(new Error('yay'));
    }, function(err, dir) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.property('message', 'yay');
      expect(fs.existsSync(dir)).to.be.false;
      done();
    });
  });

  it('should be able to add a prefix', function(done) {
    mktmpdir('foo', function(err, dir, done) {
      expect(err).to.not.exist;
      expect(dir).to.match(new RegExp('^' + escapeRegExp(os.tmpDir().replace(/\/$/, '')) + '/foo[0-9]{8}-[0-9]+-[a-z0-9]+$'));
      expect(fs.existsSync(dir)).to.be.true;
      done();
    }, function(err, dir) {
      expect(fs.existsSync(dir)).to.be.false;
      done(err);
    });
  });

  it('should be able to add a prefix and suffix', function(done) {
    mktmpdir(['foo', 'bar'], function(err, dir, done) {
      expect(err).to.not.exist;
      expect(dir).to.match(new RegExp('^' + escapeRegExp(os.tmpDir().replace(/\/$/, '')) + '/foo[0-9]{8}-[0-9]+-[a-z0-9]+bar$'));
      expect(fs.existsSync(dir)).to.be.true;
      done();
    }, function(err, dir) {
      expect(fs.existsSync(dir)).to.be.false;
      done(err);
    });
  });

  it('should be an error when prefixSuffix is not a string or array', function(done) {
    mktmpdir(8888, function(err, dir, _done) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.property('message', 'unexpected prefixSuffix: 8888');
      expect(dir).to.not.exist;
      expect(_done).to.not.exist;
      done();
    });
  });

  describe('when supplying tmpdir', function(done) {
    beforeEach(function(done) {
      var basename = crypto.randomBytes(32).toString('hex');
      this.tmpdir = path.normalize(os.tmpDir() + '/' + basename);
      fs.mkdir(this.tmpdir, done);
    });

    afterEach(function(done) {
      rimraf(this.tmpdir, done);
    });

    it('should create a tmp directory and tear down it', function(done) {
      var self = this;
      mktmpdir(null, this.tmpdir, function(err, dir, done) {
        expect(err).to.not.exist;
        expect(dir).to.match(new RegExp('^' + escapeRegExp(self.tmpdir) + '/d[0-9]{8}-[0-9]+-[a-z0-9]+$'));
        expect(fs.existsSync(dir)).to.be.true;
        done();
      }, function(err, dir) {
        expect(fs.existsSync(dir)).to.be.false;
        done(err);
      });
    });

    it('should be able to add a prefix', function(done) {
      var self = this;
      mktmpdir('foo', this.tmpdir, function(err, dir, done) {
        expect(err).to.not.exist;
        expect(dir).to.match(new RegExp('^' + escapeRegExp(self.tmpdir) + '/foo[0-9]{8}-[0-9]+-[a-z0-9]+$'));
        expect(fs.existsSync(dir)).to.be.true;
        done();
      }, function(err, dir) {
        expect(fs.existsSync(dir)).to.be.false;
        done(err);
      });
    });

    it('should be able to add a prefix and suffix', function(done) {
      var self = this;
      mktmpdir(['foo', 'bar'], this.tmpdir, function(err, dir, done) {
        expect(err).to.not.exist;
        expect(dir).to.match(new RegExp('^' + escapeRegExp(self.tmpdir) + '/foo[0-9]{8}-[0-9]+-[a-z0-9]+bar$'));
        expect(fs.existsSync(dir)).to.be.true;
        done();
      }, function(err, dir) {
        expect(fs.existsSync(dir)).to.be.false;
        done(err);
      });
    });
  });
});
