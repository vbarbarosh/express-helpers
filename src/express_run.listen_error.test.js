const assert = require('assert');
const express = require('express');
const express_run = require('./express_run');
const net = require('net');

describe('express_run', function () {
    it('should reject with the listen error when the port is taken', async function () {
        const taken = net.createServer();
        await new Promise(resolve => taken.listen(0, '127.0.0.1', resolve));
        try {
            await assert.rejects(express_run(express(), taken.address().port, '127.0.0.1'), {code: 'EADDRINUSE'});
        }
        finally {
            await new Promise(resolve => taken.close(resolve));
        }
    });
});
