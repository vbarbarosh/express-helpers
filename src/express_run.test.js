const assert = require('assert');
const express = require('express');
const express_run = require('./express_run');
const {once} = require('events');

describe('express_run', function () {
    it('should listen on the port and host given, and end once the server closes', async function () {
        const app = express();
        app.get('/', (req, res) => res.send('hello'));
        let server;
        const listen = app.listen;
        app.listen = function (...args) {
            return server = listen.apply(this, args);
        };
        const logs = [];
        const console_log = console.log;
        console.log = s => logs.push(s);
        try {
            let ended = false;
            const done = express_run(app, 0, '127.0.0.1').then(() => ended = true);
            await once(server, 'listening');
            const {address, port} = server.address();
            assert.strictEqual(address, '127.0.0.1');
            assert.deepStrictEqual(logs, [`[express_run] Listening to 127.0.0.1:${port}`]);
            assert.strictEqual(await fetch(`http://127.0.0.1:${port}/`).then(v => v.text()), 'hello');
            await new Promise(resolve => setImmediate(resolve));
            assert.strictEqual(ended, false);
            server.close();
            server.closeAllConnections();
            await done;
            assert.strictEqual(ended, true);
        }
        finally {
            console.log = console_log;
        }
    });
});
