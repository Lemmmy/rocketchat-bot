const _ = require("lodash");

const EventEmitter = require("events");
const uuid = require("uuid/v4");

const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require("websocket-as-promised");

class WebsocketAPI extends EventEmitter {
  constructor(opts) {
    super();

    this.opts = _.defaults(opts, {
      scheme: "wss",
      endpoint: "/websocket"
    });

    if (!opts.server) throw new Error("Missing option 'server' in WebsocketAPI");
    if (!opts.username) throw new Error("Missing option 'username' in WebsocketAPI");
    if (!opts.password) throw new Error("Missing option 'password' in WebsocketAPI");
  }

  async connect() {
    const opts = this.opts;

    this.emit("beforeConnect");

    this.ws = new WebSocketAsPromised(`${opts.scheme}://${opts.server}${opts.endpoint}`, {
      createWebSocket: url => new W3CWebSocket(url)
    });

    await this.ws.open();
    this.emit("opened");

    this.ws.onMessage.addListener(this.onMessageHandler.bind(this));

    this.ws.request({
      msg: "connect",
      version: "1",
      support: ["1"]
    });
  }

  async login() {
    const opts = this.opts;

    await this.method("login", [{
      "user": { "username": opts.username },
      "password": opts.password
    }]);

    this.emit("loggedIn");
  }

  onMessageHandler(msg) {
    switch (msg.msg) {
      case "connected":
        this.emit("connected");
        this.login();
        break;
      case "ping":
        this.pong();
        break;
      case "changed":
        this.onChangedEvent(msg);
        break;
    }
  }

  onChangedEvent(msg) {
    switch (msg.collection) {
      case "stream-room-messages":
        this.emit("messageRaw", msg);
        break;
    }
  }

  pong() {
    return this.ws.request({
      msg: "pong"
    });
  }

  method(method, params) {
    return this.ws.request({
      msg: "method",
      method,
      params
    });
  }

  sub(name, params) {
    return this.ws.request({
      msg: "sub",
      name,
      params
    });
  }

  sendChatMessage(rid, msg) {
    return this.method("sendMessage", [{
      _id: uuid(),
      rid,
      msg
    }]);
  }
}

module.exports = WebsocketAPI;