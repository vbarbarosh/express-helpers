const assert = require('assert');
const express = require('express');
const express_log = require('./express_log');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('express_log', function () {
    it('should log a request from its begin to its close, under one uid', async function () {
        const lines = [];
        const app = express();
        app.use(express_log({append: s => lines.push(s)}));
        app.get('/hello', (req, res) => {
            req.log('inside');
            res.send('ok');
        });
        await serve(app, async function (base) {
            assert.strictEqual(await fetch(`${base}/hello?a=1`, {headers: {'user-agent': 'test-ua'}}).then(v => v.text()), 'ok');
        });
        assert.strictEqual(lines.length, 4);
        assert.strictEqual(lines[0], '[started]');
        const uid = lines[1].match(/^\[(\w+)\]/)[1];
        assert.match(lines[1], /^\[\w+\]\[\+\d+\.\d{4}s\]\[req_begin\] GET "\/hello\?a=1" "\[ip=127\.0\.0\.1\]\[forwarded=n\/a\]\[country=n\/a\]\[ua=test-ua\]" \{.*"user-agent":"test-ua".*\}$/);
        assert.match(lines[2], /^\[\w+\]\[\+\d+\.\d{4}s\] inside$/);
        assert.match(lines[3], /^\[\w+\]\[\+\d+\.\d{4}s\]\[res_close\] 200 "OK" pending=0$/);
        for (const line of lines.slice(1)) {
            assert.ok(line.startsWith(`[${uid}]`), line);
        }
    });
    it('should give each request a uid of its own', async function () {
        const lines = [];
        const app = express();
        app.use(express_log({append: s => lines.push(s)}));
        app.get('/', (req, res) => res.send('ok'));
        await serve(app, async function (base) {
            await fetch(base).then(v => v.text());
            await fetch(base).then(v => v.text());
        });
        const uids = new Set(lines.slice(1).map(v => v.match(/^\[(\w+)\]/)[1]));
        assert.strictEqual(uids.size, 2);
    });
    it('should append to the file it is given, each line with its time', async function () {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'express_log-'));
        const file = path.join(dir, 'http.log');
        try {
            const app = express();
            app.use(express_log({file: () => file}));
            app.get('/', (req, res) => res.send('ok'));
            await serve(app, async function (base) {
                await fetch(base).then(v => v.text());
            });
            const lines = await read_lines_until(file, v => v.length === 3);
            assert.match(lines[0], /^\[\d{4}-\d\d-\d\dT[\d:.]+Z\]\[started\]$/);
            assert.match(lines[1], /^\[\d{4}-\d\d-\d\dT[\d:.]+Z\]\[\w+\]\[\+\d+\.\d{4}s\]\[req_begin\] GET "\/" /);
            assert.match(lines[2], /^\[\d{4}-\d\d-\d\dT[\d:.]+Z\]\[\w+\]\[\+\d+\.\d{4}s\]\[res_close\] 200 "OK" pending=0$/);
        }
        finally {
            fs.rmSync(dir, {recursive: true});
        }
    });
});

// The file is appended to without waiting for the response: read it until
// the expected lines are there, or the test's timeout ends it
async function read_lines_until(file, fn)
{
    while (true) {
        const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean) : [];
        if (fn(lines)) {
            return lines;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

async function serve(app, fn)
{
    const server = await new Promise((resolve, reject) => {
        const out = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve(out));
    });
    try {
        await fn(`http://127.0.0.1:${server.address().port}`);
    }
    finally {
        await new Promise(resolve => server.close(resolve).closeAllConnections());
    }
}
