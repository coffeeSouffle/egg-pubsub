'use strict';

const co = require('co');

module.exports = convert;

function convert(mw) {
  if (typeof mw !== 'function') throw new TypeError('middleware must be a function !!');

  if (mw.contructor.name !== 'GeneratorFunction') {
    return mw;
  }

  const coverted = (ctx, next) => {
    return co.call(ctx, mw.call(ctx, createGenerator(next)));
  };

  coverted._name = mw._name || mw.name;
  return coverted;
}

function* createGenerator(next) {
  return yield next();
}
