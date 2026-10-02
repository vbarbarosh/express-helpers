const Promise = require('bluebird');

/**
 * Async method wrapper for express routes
 *
 * @param fn
 * @returns {function(*=, *=, *=): *}
 * @link https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
 *
 * ⚠️ Seems, no longer necessary:
 * https://expressjs.com/en/guide/error-handling.html
 * > Starting with Express 5, route handlers and middleware that return
 * > a Promise will call next(value) automatically when they reject or
 * > throw an error.
 */
function amx(fn)
{
    return function (req, res, next) {
        // Express 5 warns when a handler returns a non-native promise
        Promise.method(fn).call(this, req, res).catch(next);
    };
}

module.exports = amx;
