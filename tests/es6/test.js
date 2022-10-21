#!/usr/bin/env node

const assert = require('assert');
const child_process = require('child_process');
const cookieParser = require('cookie-parser');
const express = require('express');
const formData = require("express-form-data");
const net = require('net');
const messages = require('../messages');
const server = express();

server.use(cookieParser());
server.get('/hello', (req, res) => {
    res.send('hello world!');
});
server.get('/hello-cookies', (req, res) => {
    res.send(`hello ${req.cookies.first_name} ${req.cookies.last_name}! (cookies)`);
});
server.post('/hello-data', express.urlencoded(), (req, res) => {
    res.send(`hello ${req.body.first_name} ${req.body.last_name}! (data)`);
});
server.post('/hello-form-data', formData.parse(), (req, res) => {
    res.send(`hello ${req.body.first_name} ${req.body.last_name}! (form-data)`);
});
server.post('/hello-json-data', express.json(), (req, res) => {
    res.send(`hello ${req.body.first_name} ${req.body.last_name}! (json data)`);
});
server.post('/hello-raw-data', express.text(), (req, res) => {
    res.send(`hello ${req.body}! (raw-data)`);
});
server.post('/hello-json', express.json(), (req, res) => {
    res.send(req.body);
});

server.listen(18066);

const mpv_args = [
    '--no-config',
    '--idle=yes',
    '--input-ipc-server=/tmp/mpv.http.test.sock',
    '--script=../http.mpv.js',
    '-v',
];
const mpv = child_process.spawn('mpv', mpv_args, {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true,
});
const mpv_sock = new net.Socket();
const mpv_output = [];

const send_command = function send_command(command) {
    mpv_sock.write(command + '\n');
};
const output_include = function output_include(message) {
    return mpv_output.includes('[http_mpv] ' + message);
};

mpv.stderr.pipe(process.stderr);
mpv.stdout.pipe(process.stdout);
mpv.stdout.on('data', (data) => {
    const output = data.toString().split('\n');
    mpv_output.push(...output);
});

mpv.on('exit', (code) => {
    console.info('mpv exited: ' + code);
    process.exit(code);
});

mpv.on('spawn', () => {
    setTimeout(() => {
        assert(output_include(messages.available));
        mpv_sock.connect('/tmp/mpv.http.test.sock', () => {
            send_command('script-message http/test');
            setInterval(() => {
                if (output_include(messages.test_done)) {
                    assert(!output_include(messages.http_request_failed));
                    send_command('quit');
                }
            }, 500);
            setTimeout(() => {
                send_command('quit 99');
                console.error('mpv http test timeout');
            }, 30 * 1000);
        });
    }, 1000);
});
