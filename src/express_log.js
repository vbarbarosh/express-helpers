const Promise = require('bluebird');
const cuid = require('cuid');
const express_fingerprint = require('./express_fingerprint');
const fs = require('fs');

let pending = 0;

function express_log(options = {})
{
    const file = options.file || function () {
        const date = new Date().toJSON().substring(0, 10);
        return `http-${date}.log`;
    };
    const append = options.append || async function (message) {
        const file_value = await valcall(file);
        return new Promise(function (resolve, reject) {
            fs.appendFile(file_value, `[${new Date().toJSON()}]${message}\n`, function (error) {
                error ? reject(error) : resolve();
            });
        });
    };

    append('[started]');

    // grep_Xai6eoxaim7gohmi8oon
    return function (req, res, next) {
        const hrtime0 = process.hrtime();
        const uid = cuid();
        pending++;
        req.log = async function (s) {
            await append(`[${uid}][+${format_hrtime(hrtime0)}]${s[0] === '[' ? '' : ' '}${s.trim()}`);
        };
        req.log(`[req_begin] ${req.method} ${json_stringify(req.url)} ${json_stringify(express_fingerprint(req))} ${json_stringify(req.headers)}`);
        res.on('close', function () {
            pending--;
            req.log(`[res_close] ${res.statusCode} ${json_stringify(res.statusMessage)} pending=${pending}`);
        });
        req.on('error', function (error) {
            req.log(`[req_error] ${json_stringify_safe({...error, message: error.message, stack: error.stack && error.stack.split(/\n\s*/)}, null, 4)}`);
        });
        next();
    };
}

function json_stringify(value, replacer, space)
{
    return JSON.stringify(value, replacer, space);
}

function json_stringify_safe(value, replacer, space)
{
    return JSON.stringify(value, replacer, space);
}

function format_hrtime(hrtime0, digits = 4)
{
    const [u, v] = process.hrtime(hrtime0);
    return (u + v/1E9).toFixed(digits) + 's';
}

function valcall(val)
{
    if (typeof val === 'function') {
        return Promise.method(val).call();
    }
    return Promise.resolve(val);
}

module.exports = express_log;
