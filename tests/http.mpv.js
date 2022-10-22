'use strict';

var msg = mp.msg;
var HttpClient = require('../HttpClient');
var messages = require('./messages');
var requests = require('./requests');

var http = new HttpClient();

if (HttpClient.available) {
    msg.info(messages.available);
}

var expected_object = function expected_response(expected, object) {
    var keys = Object.keys(expected);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var v1 = expected[key];
        var v2 = object[key];
        if (typeof v1 !== typeof v2) {
            return false;
        }
        if (typeof v1 === 'object' && !Array.isArray(v1) && expected_object(v1, v2)) {
            break;
        }
        if (JSON.stringify(v1) !== JSON.stringify(v2)) {
            return false;
        }
    }
    return true;
};

var http_test = function http_test(cb) {
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
            msg.verbose('data: ' + (typeof response.data === 'object' ? JSON.stringify(response.data) : response.data));
            msg.verbose('headers: ' + JSON.stringify(response.headers));
            msg.verbose('raw_data: ' + response.raw_data);
            msg.verbose('status code: ' + response.status_code);
            msg.verbose('status text: ' + response.status_text);
            if (!expected_object(request.response, response)) {
                failed = true;
            }
        }
        if (failed) {
            msg.error(messages.http_request_failed);
        }
        http_test(cb);
    };
    http.request(request.method, request.url, request.options, http_callback);
};

mp.register_script_message('http/test', function() {
    msg.info(messages.test_start);
    http_test(function() {
        msg.info(messages.test_done);
    });
});
