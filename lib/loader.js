'use strict';

const assert = require('assert');
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
  app.coreLogger.info(`[egg-pubsub] pubsub:${config.name} topic:${config.topic} building`);
  const topic = pubsub.topic(config.topic);

  app.coreLogger.info(`[egg-pubsub] pubsub:${config.name} subcription:${config.subscription} building`);
  let subscription;
  if (subscriptionName) {
    subscription = topic.subscription(subscriptionName);
    const [ exists ] = await subscription.exists();
    if (!exists) {
      const [ sub ] = await subscription.create();
      subscription = sub;
    }
  }

  const pubsubApp = new Application(app, pubsub, topic, subscription, config);

  app.beforeClose(async () => {
    await pubsubApp.close();
  });

  return pubsubApp;
}
