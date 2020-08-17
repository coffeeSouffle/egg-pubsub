'use strict';

const Layer = require('./layer');
const compose = require('./compose');
const debug = require('debug')('egg-pubsub');

class Router {
  constructor(options) {
    this.opts = options || {};

    this.middlewares = this.opts.middlewares || [];

    if (!Array.isArray(this.middlewares)) {
      throw new Error(
        ' `' + this.opts.name + '`: opts.middlewares must be an array of function.'
      );
    }

    this.middlewares.forEach(fn => {
      const type = (typeof fn);

      if (type !== 'function') {
        throw new Error(
          ' `' + this.opts.name + '`: opts.middlewares ' + (fn.name || '') + ' '
          + 'must be an array of function, not `' + type + '`.'
        );
      }
    }, this);

    this.stack = [];
  }

  /**
   * register router
   * @param {string} cmd command
   * @param {function} middleware function
   * @param {object} opts options
   * @param {string?} opts.name router name
   * @param {string?} opts.channel channel
   * @return {Router} router
   */
  register(cmd, middleware, opts) {
    opts = opts || {};
    const middlewares = [].concat(this.middlewares, [ middleware ]);

    const route = new Layer(cmd, middlewares, opts);

    this.stack.push(route);

    return this;
  }

  routes() {
    const router = this;
    const dispatch = (ctx, next) => {
      debug('%s %s', ctx.cmd);

      const matched = router.match(ctx);

      ctx.router = router;

      if (!matched.route) return next();

      const matchedLayers = matched.cmd;

      const layerChain = matchedLayers.reduce((memo, layer) => {
        memo.push((ctx, next) => {
          ctx.routerName = layer.name;

          return next();
        });

        return memo.concat(layer.stack);
      }, []);

      return compose(layerChain)(ctx, next);
    };

    dispatch.router = this;

    return dispatch;
  }

  middleware() {
    return this.routes();
  }

  match(ctx) {
    const layers = this.stack;
    const matched = {
      cmd: [],
      route: false,
    };

    let layer;
    for (layer of layers) {
      if (layer.match(ctx)) {
        matched.cmd.push(layer);
        matched.route = true;
      }
    }

    return matched;
  }
}

module.exports = Router;
