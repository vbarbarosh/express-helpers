const assert = require('assert');
const express = require('express');
const express_params = require('./express_params');

describe('express_params', function () {
    it('should describe a GET request', async function () {
        const app = express();
        app.get('/items/:uid', (req, res) => res.send(express_params(req)));
        await serve(app, async function (base, port) {
            const params = await fetch(`${base}/items/42?q=1`).then(v => v.json());
            assert.strictEqual(params.guessed_url, `http://127.0.0.1:${port}/items/42`);
            assert.strictEqual(params.ip, '127.0.0.1');
            assert.deepStrictEqual(params.ips, []);
            assert.strictEqual(params.protocol, 'http');
            assert.strictEqual(params.hostname, '127.0.0.1');
            assert.strictEqual(params.headers.host, `127.0.0.1:${port}`);
            assert.strictEqual(params.method, 'GET');
            assert.strictEqual(params.baseUrl, '');
            assert.strictEqual(params.originalUrl, '/items/42?q=1');
            assert.strictEqual(params.url, '/items/42?q=1');
            assert.strictEqual(params.path, '/items/42');
            assert.deepStrictEqual(params.query, {q: '1'});
            assert.strictEqual(params.body, null);
            assert.deepStrictEqual(params.params, {uid: '42'});
        });
    });
    it('should guess https from x-forwarded-proto', async function () {
        const app = express();
        app.get('/a', (req, res) => res.send(express_params(req)));
        await serve(app, async function (base, port) {
            const params = await fetch(`${base}/a`, {headers: {'x-forwarded-proto': 'https'}}).then(v => v.json());
            assert.strictEqual(params.guessed_url, `https://127.0.0.1:${port}/a`);
            assert.strictEqual(params.protocol, 'http');
        });
    });
    it('should return the parsed body', async function () {
        const app = express();
        app.use(express.json());
        app.post('/a', (req, res) => res.send(express_params(req)));
        await serve(app, async function (base) {
            const init = {method: 'POST', headers: {'content-type': 'application/json'}, body: '{"x":1}'};
            const params = await fetch(`${base}/a`, init).then(v => v.json());
            assert.strictEqual(params.method, 'POST');
            assert.deepStrictEqual(params.body, {x: 1});
        });
    });
});

async function serve(app, fn)
{
    const server = await new Promise((resolve, reject) => {
        const out = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve(out));
    });
    try {
        const {port} = server.address();
        await fn(`http://127.0.0.1:${port}`, port);
    }
    finally {
        await new Promise(resolve => server.close(resolve).closeAllConnections());
    }
}
