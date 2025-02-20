function express_params(req)
{
    return {
        guessed_url : `${req.headers['x-forwarded-proto'] ?? req.protocol}://${req.headers['host']}${req.path}`,
        // https://expressjs.com/en/api.html#req.ip
        ip: req.ip || null,
        ips: req.ips || null,
        // https://expressjs.com/en/api.html#req.protocol
        protocol: req.protocol,
        // https://expressjs.com/en/api.html#req.hostname
        hostname: req.hostname,
        // https://expressjs.com/en/api.html#req.headers
        headers: req.headers,
        // https://expressjs.com/en/api.html#req.method
        method: req.method,
        // https://expressjs.com/en/api.html#req.baseUrl
        baseUrl: req.baseUrl,
        // https://expressjs.com/en/api.html#req.originalUrl
        originalUrl: req.originalUrl,
        // https://expressjs.com/en/api.html#req.url
        url: req.url,
        // https://expressjs.com/en/api.html#req.path
        path: req.path,
        // https://expressjs.com/en/api.html#req.query
        query: req.query,
        // https://expressjs.com/en/api.html#req.body
        body: req.body || null,
        // https://expressjs.com/en/api.html#req.params
        params: req.params,
    };
}

module.exports = express_params;
