const _ = require("lodash");

const EventEmitter = require("events");
const glob = require("glob");
const path = require("path");
const aggregation = require("aggregation/es6");

const BotCommander = require("bot-commander").BotCommand;
BotCommander.prototype.help = require("./bot-help.js");

const WebAPI = require("./api-web.js");
const WebsocketAPI = require("./api-ws.js");

class Bot extends aggregation(EventEmitter, BotCommander) {
  constructor(opts) {
    super();

    Object.assign(this, new BotCommander());

    this.opts = _.defaults(opts, {
      commandPrefix: "!",
      webAPI: {},
      wsAPI: {}
    });

    if (!opts.server) throw new Error("Missing option 'server' in Bot");
    if (!opts.username) throw new Error("Missing option 'username' in Bot");
    if (!opts.password) throw new Error("Missing option 'password' in Bot");

    this.channels = {};
    this.groups = {};
    this.users = {};

    this.webAPI = new WebAPI(Object.assign({}, opts, opts.webAPI));
    this.wsAPI = new WebsocketAPI(Object.assign({}, opts, opts.wsAPI));

    this.wsAPI.on("loggedIn", this.onLoggedIn.bind(this));
    this.wsAPI.on("messageRaw", this.onRawMessage.bind(this));
  }

  async start() {
    await this.wsAPI.connect();
  }

  getRoomFromID(rid) {
    return this.channels[rid] || this.groups[rid];
  }

  getUserFromID(uid) {
    return this.users[uid];
  }

  async fetchChannels() {
    this.emit("fetchingChannels");

    const res = await this.webAPI.request("GET", "channels.list");

    _.each(res.channels, channel => {
      this.channels[channel._id] = channel;
      this.emit("channelAdded", channel);
      this.wsAPI.sub("stream-room-messages", [channel._id, false]);
    });
  }

  async fetchGroups() {
    this.emit("fetchingGroups");

    const res = await this.webAPI.request("GET", "groups.list");

    _.each(res.groups, group => {
      this.groups[group._id] = group;
      this.emit("groupAdded", group);
    });
  }

  async fetchUsers() {
    this.emit("fetchingUsers");

    const res = await this.webAPI.request("GET", "users.list");

    _.each(res.users, user => {
      this.users[user._id] = user;
      this.emit("userAdded", user);
    });
  }

  async onLoggedIn() {
    await Promise.all([ this.fetchChannels(), this.fetchGroups(), this.fetchUsers() ]);
    this.emit("ready");
  }

  onRawMessage(msgRaw) {
    msgRaw.fields.args.forEach(msg => {
      msg.room = this.getRoomFromID(msg.rid);
      msg.user = this.getUserFromID(msg.u._id);

      this.emit("message", msg);
      this.parse(msg.msg, msg);
    });
  }

  async loadPlugins(dir) {
    const opts = this.opts;

    this
      .prefix(opts.commandPrefix)
      .setSend((meta, message) => {
        this.wsAPI.sendChatMessage(meta.rid, message);
      });

    glob(path.join(dir, "/**/plugin.js"), (err, files) => {
      files.forEach(file => {
        this.load(file);
      });
    });
  }
}

module.exports = Bot;