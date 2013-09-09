var expect = require('chai').expect
  , os = require('os')
  , fs = require('fs')
  , join = require('path').join
  , mktmpdir = require('../');


function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

describe('mktmpdir', function() {
  it('should create a directory and remove after that', function(done) {
    mktmpdir(function(err, dir, done) {
      expect(err).to.not.exist;
      expect(dir).to.match(new RegExp('^' + escapeRegExp(os.tmpDir().replace(/\/$/, '')) + '/d[0-9]{8}-[0-9]+-[a-z0-9]+$'));
      expect(fs.existsSync(dir)).to.be.true;
      done(err);
    }, function(err, dir) {
      expect(fs.existsSync(dir)).to.be.false;
      done(err);
    });
  });
});
