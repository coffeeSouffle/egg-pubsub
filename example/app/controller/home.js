'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.app.pubsub.publish('test');
  }
}

module.exports = HomeController;
