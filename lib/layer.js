'use strict';

const debug = require('debug')('cs-pubsub');

class Layer {
  constructor(cmd, middleware, opts) {
    this.opts = opts || {};
    this.name = this.opts.name || null;
    this.stack = Array.isArray(middleware) ? middleware : [ middleware ];

    this.stack.forEach(fn => {
      const type = (typeof fn);
      if (type !== 'function') {
        throw new Error(
          cmd + ' `' + (this.opts.name || cmd) + '`: `middleware` '
          + 'must be a function, not `' + type + '`.'
        );
      }
    }, this);

    this.cmd = cmd;

    debug('defined route %s', this.cmd);
  }

  match(cmd) {
    return (this.cmd === cmd);
  }
}

module.exports = Layer;
