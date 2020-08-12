'use strict';

const PUBSUB = Symbol('EGG-PUBSUB#PUBSUB');
const TOPIC = Symbol('EGG-PUBSUB#TOPIC');
const SUBSCRIPTION = Symbol('EGG-PUBSUB#TOPIC');
const Context = require('./context');
const isGeneratorFunction = require('is-generator-function');
const compose = require('./compose');
const convert = require('./convert');

class Application {
  constructor(app, pubsub, topic, subscription, config) {
    this.app = app;
    this[PUBSUB] = pubsub;
    this[TOPIC] = topic;
    this[SUBSCRIPTION] = subscription;

    this.name = config.name;
    this.config = config;
    this.middleware = [];
  }

  get pubsub() {
    return this[PUBSUB];
  }

  get topic() {
    return this[TOPIC];
  }

  get subscription() {
    return this[SUBSCRIPTION];
  }

  isSubscribe() {
    return (this.subscription !== undefined);
  }

  deleteSubAfterClose() {
    return this.config.deleteSubAfterClose;
  }

  async publish(cmd, data, options = {}) {
    const { channel = '' } = options;
    const msg = {
      cmd, data, channel,
    };

    const json = JSON.stringify(msg);
    const buf = Buffer.from(json);

    return this.topic.publish(buf);
  }

  createContext(msg) {
    const ctx = this.app.createAnonymousContext();
    return new Context(ctx, msg);
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('[egg-pubsub] middleware must be a function !!');
    if (isGeneratorFunction(fn)) {
      fn = convert(fn);
    }

    this.middleware.push(fn);

    return this;
  }

  callback() {
    const fn = compose(this.middleware);
    const handle = msg => {
      const ctx = this.createContext(msg);
      const result = this.handle(ctx, fn);

      msg.ack();
      return result;
    };

    return handle;
  }

  handle(ctx, fnMiddleware) {
    return fnMiddleware(ctx);
  }

  async close() {
    if (this.isSubscribe()) {
      await this.subscription.close();

      if (this.deleteSubAfterClose()) {
        await this.subscription.delete();
      }
    }
  }
}

module.exports = Application;
