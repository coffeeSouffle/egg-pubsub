'use strict';

module.exports = app => {
  if (app.config.pubsub.app) require('./lib/loader')(app);
};
