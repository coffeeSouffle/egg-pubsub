'use strict';

const loader = require('./lib/loader');

module.exports = agent => {
  if (agent.config.pubsub.agent) loader(agent);
};
