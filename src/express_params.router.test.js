const assert = require('assert');
const express = require('express');
const express_params = require('./express_params');

describe('express_params', function () {
    it('should guess the url of a request inside a router, its mount path too', async function () {
        const app = express();
        const router = express.Router();
        router.get('/items/:uid', (req, res) => res.send(express_params(req)));
        app.use('/api', router);
        const server = await new Promise((resolve, reject) => {
            const out = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve(out));
        });
        try {
            const {port} = server.address();
            const params = await fetch(`http://127.0.0.1:${port}/api/items/42?q=1`).then(v => v.json());
            assert.strictEqual(params.guessed_url, `http://127.0.0.1:${port}/api/items/42`);
            assert.strictEqual(params.baseUrl, '/api');
            assert.strictEqual(params.path, '/items/42');
        }
        finally {
            await new Promise(resolve => server.close(resolve).closeAllConnections());
        }
    });
});
