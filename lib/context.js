'use strict';

class Context {
  constructor(ctx, msg) {
    this.ctx = ctx;
    this.message = msg;

    const {
      cmd, data, channel,
    } = JSON.parse(msg.data.toString());

    this.cmd = cmd;
    this.channel = channel;
    this.data = data;
  }
}

module.exports = Context;
