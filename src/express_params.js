function express_params(req)
{
    return {
        // https://expressjs.com/en/api.html#req.hostname
        hostname: req.hostname,
        // https://expressjs.com/en/api.html#req.headers
        headers: req.headers,
        // https://expressjs.com/en/api.html#req.method
        method: req.method,
        // https://expressjs.com/en/api.html#req.params
        params: req.params,
        // https://expressjs.com/en/api.html#req.url
        url: req.url,
        // https://expressjs.com/en/api.html#req.path
        path: req.path,
        // https://expressjs.com/en/api.html#req.query
        query: req.query,
        // https://expressjs.com/en/api.html#req.body
        body: req.body || null,
    };
}

export default express_params;
