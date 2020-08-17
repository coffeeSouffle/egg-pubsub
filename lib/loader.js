'use strict';

const assert = require('assert');
const path = require('path');
const Application = require('./application');

module.exports = app => {
  app.addSingleton('pubsub', creator);
};

async function creator(config, app) {
  assert(config.name, '[egg-pubsub] name is required.');
  assert(config.topic, `[egg-pubsub] pubsub: ${config.name} topic is required.`);

  const { PubSub } = require('@google-cloud/pubsub');

  let subscriptionName = config.subscription;
  if (config.isSubscribe && !subscriptionName) {
    subscriptionName = [ process.env.HOSTNAME, config.name ].join('-');
  }

  if (typeof config.subscription === 'function') {
    subscriptionName = config.subscription(config);
  }

  const pubsub = new PubSub(config);
  app.coreLogger.info(`[egg-pubsub] pubsub:${config.name} topic:${config.topic} connect`);
  const topic = pubsub.topic(config.topic);

  app.coreLogger.info(`[egg-pubsub] pubsub:${config.name} subcription:${config.subscription} connect`);
  let subscription;
  let router;
  if (subscriptionName) {
    subscription = topic.subscription(subscriptionName);
    const [ exists ] = await subscription.exists();
    if (!exists) {
      const [ sub ] = await subscription.create();
      subscription = sub;
    }

    if (config.routerPath) {
      if (typeof config.routerPath === 'function') {
        router = config.routerPath;
      } else {
        router = require(config.routerPath);
      }
    } else {
      router = require(path.join(app.baseDir, 'pubsub', `${config.name}.js`));
    }

    assert(typeof router === 'function', `[egg-pubsub] pubsub:${config.name} router is not function.`);
  }

  const pubsubApp = new Application(app, pubsub, topic, subscription, config);

  app.beforeStart(async () => {
    if (pubsubApp.isSubscribe()) {
      router(pubsubApp);
      pubsubApp.listen();
    }
  });

  app.beforeClose(async () => {
    await pubsubApp.close();
  });

  return pubsubApp;
}
