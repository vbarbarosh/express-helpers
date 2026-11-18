const assert = require('assert');
const express_fingerprint = require('./express_fingerprint');

describe('express_fingerprint', function () {
    it('should list ip, forwarded, country and user agent', function () {
        const req = {
            socket: {remoteAddress: '10.0.0.1'},
            headers: {'x-forwarded-for': '1.2.3.4', 'cf-ipcountry': 'MD', 'user-agent': 'curl/8.0'},
        };
        assert.strictEqual(express_fingerprint(req), '[ip=10.0.0.1][forwarded=1.2.3.4][country=MD][ua=curl/8.0]');
    });
    it('should write n/a for missing headers', function () {
        const req = {socket: {remoteAddress: '10.0.0.1'}, headers: {}};
        assert.strictEqual(express_fingerprint(req), '[ip=10.0.0.1][forwarded=n/a][country=n/a][ua=n/a]');
    });
});
