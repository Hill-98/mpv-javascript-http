'use strict';

var msg = mp.msg;
var HttpClient = require('../HttpClient');
var messages = require('./messages');
var requests = require('./requests');

var http = new HttpClient();

if (HttpClient.available) {
    msg.info(messages.available);
}

var expected_response = function expected_response(expected, response) {
    var keys = Object.keys(expected);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var v1 = expected[key];
        var v2 = response[key];
        if (JSON.stringify(v1) !== JSON.stringify(v2)) {
            return false;
        }
    }
    return true;
}

function http_test(cb) {
    var request = requests.shift();
    if (!request) {
        cb();
        return;
    }

    msg.info(request.method + ': ' + request.url);
    var http_callback = function(err, response) {
        var failed = false;
        if (err) {
            failed = true;
            msg.error(err);
        } else {
            msg.verbose('data: ' + JSON.stringify(response.data));
            msg.verbose('headers: ' + JSON.stringify(response.headers));
            msg.verbose('raw_data: ' + JSON.stringify(response.raw_data));
            msg.verbose('status code: ' + response.status_code);
            if (!expected_response(request.response, response)) {
                failed = true;
            }
        }
        if (failed) {
            msg.error(messages.http_request_failed);
        }
        http_test(cb);
    };
    http.request(request.method, request.url, request.options, http_callback);
}

mp.register_script_message('http/test', function() {
    msg.info(messages.test_start);
    http_test(function() {
        msg.info(messages.test_done);
    });
});
