const _ = require("lodash");

const req = require("request-promise-native");

class WebAPI {
  constructor(opts) {
    this.opts = _.defaults(opts, {
      scheme: "https",
      endpoint: "/api/v1/"
    });

    if (!opts.server) throw new Error("Missing option 'server' in WebAPI");
    if (!opts.username) throw new Error("Missing option 'username' in WebAPI");
    if (!opts.password) throw new Error("Missing option 'password' in WebAPI");
  }

  async login() {
    const opts = this.opts;

    const res = await req({
      method: "POST",
      uri: `${opts.scheme}://${opts.server}${opts.endpoint}login`,
      body: {
        username: opts.username,
        password: opts.password
      },
      json: true
    });

    const data = res.data;

    this.authToken = data.authToken;
    this.userId = data.userId;
  }

  async request(verb, method, params, attempts) {
    const opts = this.opts;

    attempts = attempts || 0;

    let requestData = {
      method: verb,
      uri: `${opts.scheme}://${opts.server}${opts.endpoint}${method}`,
      json: true,
      headers: {
        "X-Auth-Token": this.authToken,
        "X-User-Id": this.userId
      }
    };

    if (params) {
      if (verb.toLowerCase() === "get") {
        requestData.qs = params;
      } else {
        requestData.body = params;
      }
    }

    try {
      return await req(requestData);
    } catch (err) {
      if (err.statusCode === 401) {
        if (attempts >= 3) {
          throw new Error("Could not auth to WebAPI after 3 attempts", err);
        }

        await this.login();
        return await this.request(verb, method, params, ++attempts);
      }

      throw err;
    }
  }
}

module.exports = WebAPI;