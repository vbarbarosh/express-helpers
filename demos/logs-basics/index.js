#!/usr/bin/env node

const Promise = require('bluebird');
const cli = require('@vbarbarosh/node-helpers/src/cli');
const express = require('express');
const express_log = require('../../src/express_log');
const express_params = require('../../src/express_params');
const express_routes = require('../../src/express_routes');
const express_run = require('../../src/express_run');

cli(main);

async function main()
{
    const app = express();

    app.use(express_log({
        append: s => process.stderr.write(`[${new Date().toJSON()}]${s}\n`),
    }));

    express_routes(app, [
        {req: 'GET /', fn: echo},
        {req: 'GET /long', fn: long},
        {req: 'GET /api/v1/articles.json', fn: route_articles_list},
        {req: 'POST /api/v1/articles', fn: route_articles_create},
        {req: 'DELETE /api/v1/articles/:article_uid', fn: route_articles_delete},
        {req: 'PATCH /api/v1/articles/:article_uid', fn: route_articles_update},
        {req: 'PUT /api/v1/articles/:article_uid', fn: route_articles_replace},
        {req: 'ALL *', fn: page404},
    ]);

    await express_run(app);
}

async function long(req, res)
{
    req.log('[log_begin]');
    await Promise.delay(500);
    req.log('[log_end]');
    res.send('OK');
}

// GET /api/v1/articles.json
async function route_articles_list(req, res)
{
    res.send({
        limit: 10,
        offset: 0,
        total: 100,
        items: [],
    });
}

// POST /api/v1/articles
async function route_articles_create(req, res)
{
    res.status({uid: 'na', message: 'POST /api/v1/articles'});
}

// DELETE /api/v1/articles/:article_uid
async function route_articles_delete(req, res)
{
    const {article_uid} = req.params;
    res.status({uid: article_uid, message: `DELETE /api/v1/articles/${articles}`});
}

// PATCH /api/v1/articles/:article_uid
async function route_articles_update(req, res)
{
    const {article_uid} = req.params;
    res.status({uid: article_uid, message: `PATCH /api/v1/articles/${articles}`});
}

// PUT /api/v1/articles/:article_uid
async function route_articles_replace(req, res)
{
    const {article_uid} = req.params;
    res.status({uid: article_uid, message: `PUT /api/v1/articles/${articles}`});
}

async function echo(req, res)
{
    res.status(200).send(express_params(req));
}

async function page404(req, res)
{
    res.status(404).send(`Page not found: ${req.path}`);
}
