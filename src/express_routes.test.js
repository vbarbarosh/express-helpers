const assert = require('assert');
const express = require('express');
const express_routes = require('./express_routes');

describe('express_routes', function () {
    it('should return the app', function () {
        const app = express();
        assert.strictEqual(express_routes(app, []), app);
    });
    it('should route each method and path to its fn', async function () {
        const app = express();
        const routes = [
            {req: 'GET /articles', fn: (req, res) => res.send('list')},
            {req: 'POST /articles', fn: (req, res) => res.send('create')},
            {req: 'DELETE /articles/:uid', fn: (req, res) => res.send(`delete ${req.params.uid}`)},
            {req: 'ALL /{*splat}', fn: (req, res) => res.status(404).send(`404 ${req.method} ${req.path}`)},
        ];
        express_routes(app, routes);
        await serve(app, async function (base) {
            assert.deepStrictEqual(await call(`${base}/articles`), [200, 'list']);
            assert.deepStrictEqual(await call(`${base}/articles`, 'POST'), [200, 'create']);
            assert.deepStrictEqual(await call(`${base}/articles/42`, 'DELETE'), [200, 'delete 42']);
            assert.deepStrictEqual(await call(`${base}/articles/42`, 'PUT'), [404, '404 PUT /articles/42']);
            assert.deepStrictEqual(await call(`${base}/nowhere`), [404, '404 GET /nowhere']);
        });
    });
    it('should call fn with req, res, its route and all routes', async function () {
        const app = express();
        let actual;
        const routes = [{req: 'GET /a', fn: (...args) => { actual = args; args[1].send('ok'); }}];
        express_routes(app, routes);
        await serve(app, async function (base) {
            await call(`${base}/a`);
        });
        assert.strictEqual(actual.length, 4);
        assert.strictEqual(actual[0].path, '/a');
        assert.strictEqual(typeof actual[1].send, 'function');
        assert.strictEqual(actual[2], routes[0]);
        assert.strictEqual(actual[3], routes);
    });
    it('should take fn.default, as from an ES module', async function () {
        const app = express();
        express_routes(app, [{req: 'GET /a', fn: {default: (req, res) => res.send('default')}}]);
        await serve(app, async function (base) {
            assert.deepStrictEqual(await call(`${base}/a`), [200, 'default']);
        });
    });
    it('should pass an error of an async fn to the error handler', async function () {
        const app = express();
        express_routes(app, [{req: 'GET /a', fn: async () => { throw new Error('boom'); }}]);
        app.use((error, req, res, next) => res.status(500).send(`handled ${error.message}`));
        await serve(app, async function (base) {
            assert.deepStrictEqual(await call(`${base}/a`), [500, 'handled boom']);
        });
    });
});

async function call(url, method = 'GET')
{
    const res = await fetch(url, {method});
    return [res.status, await res.text()];
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
