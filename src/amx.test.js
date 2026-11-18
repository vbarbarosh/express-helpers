const Bluebird = require('bluebird');
const amx = require('./amx');
const assert = require('assert');

describe('amx', function () {
    it('should return a native promise, even for a Bluebird one', async function () {
        const out = amx(() => Bluebird.resolve(5))({}, {}, () => {});
        assert.strictEqual(Object.getPrototypeOf(out), Promise.prototype);
        assert.strictEqual(await out, 5);
    });
    it('should call fn with this, req and res', async function () {
        const self = {}, req = {}, res = {};
        let actual;
        await amx(function (...args) { actual = [this, ...args]; }).call(self, req, res, () => {});
        assert.deepStrictEqual(actual.length, 3);
        assert.strictEqual(actual[0], self);
        assert.strictEqual(actual[1], req);
        assert.strictEqual(actual[2], res);
    });
    it('should pass an error thrown by fn to next', async function () {
        const error = new Error('thrown');
        let actual;
        await amx(() => { throw error; })({}, {}, e => actual = e);
        assert.strictEqual(actual, error);
    });
    it('should pass a rejection of fn to next', async function () {
        const error = new Error('rejected');
        let actual;
        await amx(async () => { throw error; })({}, {}, e => actual = e);
        assert.strictEqual(actual, error);
    });
    it('should not call next when fn succeeds', async function () {
        let calls = 0;
        await amx(async () => 1)({}, {}, () => calls++);
        assert.strictEqual(calls, 0);
    });
});
