"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment-timezone");
// refer to wakatime api documentation when needed: https://wakatime.com/developers
var resource_url_prefix = 'https://wakatime.com/api/v1/users/current';
// prepare base64-encoded api_key for authntication
var API_KEY = process.env.API_KEY; // set your API key in certain github repository
var api_key_b64_encoded = Buffer.from(API_KEY).toString('base64');
var top_3 = [];
var time_total = null;
var time_7_days = null;
// top 3 languages
var p0 = fetch("".concat(resource_url_prefix, "/stats"), {
    headers: {
        'Authorization': "Basic ".concat(api_key_b64_encoded)
    }
}).then(function (resp) { return resp.json(); }).then(function (json) {
    for (var i = 0; i < 3; i++) {
        top_3.push(json['data']['languages'][i]);
    }
});
// total coding time over last 7 days
var params = new URLSearchParams();
params.append('range', 'Last 7 Days');
var p1 = fetch("".concat(resource_url_prefix, "/summaries?").concat(params.toString()), {
    headers: {
        'Authorization': "Basic ".concat(api_key_b64_encoded)
    },
}).then(function (resp) { return resp.json(); }).then(function (json) {
    time_7_days = json['cumulative_total']['text'];
});
// total time spent with wakatime
var p2 = fetch("".concat(resource_url_prefix, "/all_time_since_today"), {
    headers: {
        'Authorization': "Basic ".concat(api_key_b64_encoded)
    },
}).then(function (resp) { return resp.json(); }).then(function (json) {
    time_total = json['data']['text'];
});
Promise.all([p0, p1, p2]).then(function () {
    console.log(moment().tz("Asia/Shanghai").format('YYYY-MM-DD, HH:mm:ss'));
    console.log(time_7_days);
    console.log(time_total);
    console.log(top_3);
});
