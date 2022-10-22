#!/usr/bin/env node

const assert = require('assert');
const child_process = require('child_process');
const cookieParser = require('cookie-parser');
const express = require('express');
const formData = require('express-form-data');
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
server.get('/hello-headers', (req, res) => {
    res.header('first_name', 'first');
    res.header('last_name', 'last');
    res.send(`hello headers!`);
});
server.get('/hello-redirect', (req, res) => {
    res.status(302);
    res.location('/hello-redirect-1');
    res.send('Go to ' + res.get('location'));
});
server.get('/hello-redirect-1', (req, res) => {
    res.status(302);
    res.location('/hello-redirect-2');
    res.send('Go to ' + res.get('location'));
});
server.get('/hello-redirect-2', (req, res) => {
    res.status(302);
    res.location('/hello-redirect-3');
    res.send('Go to ' + res.get('location'));
});
server.get('/hello-redirect-3', (req, res) => {
    res.status(204);
    res.send();
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

const is_windows = process.platform === 'win32';

const mpv_ipc_path = is_windows ? '\\\\.\\pipe\\mpv-http-test-sock' : '/tmp/mpv-http-test.sock';

const mpv_args = [
    '--no-config',
    '--idle=yes',
    '--input-ipc-server=' + mpv_ipc_path,
    '--script=../http.mpv.js',
    '-v',
];
const mpv = child_process.spawn(is_windows ? 'mpv.com' : 'mpv', mpv_args, {
    cwd: __dirname,
    stdio: 'pipe',
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
    const output = data.toString().replaceAll('\r', '').split('\n');
    mpv_output.push(...output);
});
mpv.on('error', (err) => {
    console.error(err);
});
mpv.on('exit', (code) => {
    console.info('mpv exited: ' + code);
    process.exit(code);
});

mpv.on('spawn', () => {
    setTimeout(() => {
        assert(output_include(messages.available));
        mpv_sock.connect(mpv_ipc_path, () => {
            send_command('script-message http/test');
            setInterval(() => {
                if (output_include(messages.test_done)) {
                    assert(!output_include(messages.http_request_failed));
                    send_command('quit');
                }
            }, 500);
        });
    }, 1000);
});

setTimeout(() => {
    console.error('test timeout');
    process.exit(99);
}, 60 * 1000);

process.on('exit', () => {
    mpv_sock.destroy();
    mpv.kill();
});
