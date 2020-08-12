'use strict';

module.exports = agent => {
  if (agent.config.pubsub.agent) require('./lib/loader')(agent);
};
