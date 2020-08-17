'use strict';

module.exports = () => {
  return {
    pubsub: {
      client: {
        name: 'example',
        topic: 'examplePub',
        subscription: 'exampleSub',
      },
    },
  };
};
