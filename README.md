# egg-pubsub

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-pubsub.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-pubsub
[travis-image]: https://img.shields.io/travis/eggjs/egg-pubsub.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-pubsub
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-pubsub.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-pubsub?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-pubsub.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-pubsub
[snyk-image]: https://snyk.io/test/npm/egg-pubsub/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-pubsub
[download-image]: https://img.shields.io/npm/dm/egg-pubsub.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-pubsub

<!--
Description here.
-->

## Install

```bash
$ npm i egg-pubsub --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.pubsub = {
  enable: true,
  package: 'egg-pubsub',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.pubsub = {
  client: {
    name: 'pubsubName',
    /**
     * @var topic google cloud topic name, it is optional.
     */
    topic: 'topic name',
    /**
     * @var subscription google cloud subscription name, it is optional.
     */
    subscription: 'subscribe name',

    /**
     * the document contains more detailed information about the settings of pubsub
     * https://cloud.google.com/nodejs/docs/reference/pubsub/0.28.x/PubSub
     */
  }
};
```

```js
// {app_root}/pubsub/pubsubName.js
module.exports = pubsubApp => {
  pubsubApp.router.register('test', async context => {
    console.log(context.cmd);
  });
}
```

```js
// {app_root}/app/controller/home.js
const controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.app.pubsub.publish('test');
  }
}

module.exports = HomeController;
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/coffeeSouffle/egg-pubsub/issues).

## License

[MIT](LICENSE)
