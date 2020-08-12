'use strict';

const assert = require('assert');
// const awaitFirst = require('await-first');
// const path = require('path');
const Application = require('./application');

module.exports = app => {
  app.addSingleton('pubsub', creator);
};

async function creator(config, app) {
  const pubsubs = [];
  const { PubSub } = require('@google-cloud/pubsub');

  if (!config.datasources) {
    pubsubs.push(load(config));
  } else {
    let datasource;
    for (datasource of config.datasources) {
      pubsubs.push(load(datasource));
    }
  }

  app.beforeStart(async () => {
    await Promise.all(pubsubs);
  });

  async function load(config) {
    assert(config.name, '[egg-pubsub] name is required.');
    assert(config.topic, `[egg-pubsub] pubsub name: ${config.name}, topic is required.`);

    const pubsubs = app.pubsub = app.pubsub || {};
    if (pubsubs[config.name]) {
      throw new Error(`[egg-pubsub] app.pubsub.${config.name} is already defined.`);
    }

    const pubsub = new PubSub(config);

    app.coreLogger.info(`[egg-pubsub] ${config.name} google cloud pubsub topic ${config.topic} building`);
    const topic = pubsub.topic(config.topic);
    app.coreLogger.info(`[egg-pubsub] ${config.name} google cloud pubsub topic ${config.topic} finish`);

    app.coreLogger.info(`[egg-pubsub] ${config.name} google cloud pubsub subcription ${config.subscription} building`);
    if (config.isSubscribe && !config.subscription) {
      config.subscription = [ process.env.HOSTNAME, config.name ].join('-');
      delete config.isSubscribe;
    }

    let subscription;
    if (config.subscription) {
      subscription = topic.subscription(config.subscription);
      const [ exists ] = await subscription.exists();
      if (!exists) {
        const [ sub ] = await subscription.create();
        subscription = sub;
      }
    }
    app.coreLogger.info(`[egg-pubsub] ${config.name} google cloud pubsub subcription ${config.subscription} finished`);

    const client = new Application(app, pubsub, topic, subscription, config);

    Object.defineProperty(pubsubs, config.name, {
      value: client,
      writable: false,
      configurable: true,
    });

    app.beforeClose(async () => {
      await client.close();
    });

    return client;
  }
}
