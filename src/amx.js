const Promise = require('bluebird');

/**
 * Async method wrapper for express routes
 *
 * @param fn
 * @returns {function(*=, *=, *=): *}
 * @link https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
 */
function amx(fn)
{
    return function (req, res, next) {
        return Promise.method(fn).call(this, req, res).catch(next);
    };
}

module.exports = amx;
