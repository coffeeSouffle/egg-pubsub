'use strict';

const mock = require('egg-mock');

describe('test/pubsub.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/pubsub-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, pubsub')
      .expect(200);
  });
});
