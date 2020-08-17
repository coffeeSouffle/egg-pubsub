'use strict';

module.exports = pubsub => {
  pubsub.router.register('test', async context => {
    console.log(context.cmd);
  });
};
