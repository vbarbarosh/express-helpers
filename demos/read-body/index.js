#!/usr/bin/env node

const cli = require('@vbarbarosh/node-helpers/src/cli');
const express = require('express');
const express_params = require('../../src/express_params');
const express_routes = require('../../src/express_routes');
const express_run = require('../../src/express_run');
const stream = require('stream');

cli(main);

async function main()
{
    const app = express();

    express_routes(app, [
        {req: 'GET /', fn: echo},
        {req: 'ALL /echo', fn: echo},
        {req: 'ALL /echo/*', fn: echo},
        {req: 'POST /xmljson', fn: xmljson},
        {req: 'ALL *', fn: page404},
    ]);

    await express_run(app);
}

async function xmljson(req, res)
{
    let body = await stream.Readable.from(req).toArray().then(v => v[0].toString());
    switch (req.headers['content-type']) {
    // curl http://127.0.0.1:3000/xmljson -d @a.xml -H Content-Type:text/plain
    case 'text/xml':
        break;
    // curl http://127.0.0.1:3000/xmljson -d @a.xml -H Content-Type:text/xml
    case 'text/plain':
        break;
    // curl http://127.0.0.1:3000/xmljson -d @a.xml
    case 'application/x-www-form-urlencoded':
        break;
    // curl http://127.0.0.1:3000/xmljson -d @a.json -H Content-Type:application/json
    case 'application/json':
        body = JSON.parse(body);
        break;
    }
    res.send({body});
}

async function echo(req, res)
{
    res.status(200).send(express_params(req));
}

async function page404(req, res)
{
    res.status(404).send(`Page not found: ${req.path}`);
}
