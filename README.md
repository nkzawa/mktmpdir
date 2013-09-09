mktmpdir
==================
[![Build Status](https://travis-ci.org/nkzawa/mktmpdir.png?branch=master)](https://travis-ci.org/nkzawa/mktmpdir)

Create a temporary directory, ported from Ruby's [Dir.mktmpdir](http://www.ruby-doc.org/stdlib-2.0/libdoc/tmpdir/rdoc/Dir.html#method-c-mktmpdir).

```js
var mktmpdir = require('mktmpdir');

mktmpdir(function(err, dir, done) {
  if (err) return done(err);
  // use the directory...
  fs.writeFile(dir + '/foo', 'hello, World', done);
}, function(err, dir) {
  // the directory has been removed.
});
```

## License
MIT
