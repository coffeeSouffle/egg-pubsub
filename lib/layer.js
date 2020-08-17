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

    if (typeof cmd !== 'string' || cmd instanceof RegExp) {
      throw new Error(`[egg-pubsub] cmd ${this.name} data type is invalid`);
    }

    this.cmdIsRegExp = (cmd instanceof RegExp);
    this.cmd = cmd;

    debug('defined route %s', this.cmd);
  }

  match(ctx) {
    if (this.cmdIsRegExp) {
      return this.cmd.test(ctx.cmd);
    }

    return (this.cmd === ctx.cmd);
  }
}

module.exports = Layer;
