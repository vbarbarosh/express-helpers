A set of helpers for working with `express`.

## Installation

```shell
npm install @vbarbarosh/express-helpers
```

## Quick Start

```shell
echo {} > package.json
npm install body-parser express @vbarbarosh/node-helpers @vbarbarosh/express-helpers
cat > index.js << EOF
#!/usr/bin/env node

// A basic template for node express apps

const body_parser = require('body-parser');
const cli = require('@vbarbarosh/node-helpers/src/cli');
const express = require('express');
const express_params = require('@vbarbarosh/express-helpers/src/express_params');
const express_routes = require('@vbarbarosh/express-helpers/src/express_routes');
const express_run = require('@vbarbarosh/express-helpers/src/express_run');
const path = require('path');

cli(main);

async function main()
{
    const app = express();

    app.use(express.static(path.resolve(__dirname, 'static')));
    app.use(body_parser.json());

    express_routes(app, [
        {req: 'GET /', fn: echo},
        {req: 'GET /api/v1/articles.json', fn: echo},
        {req: 'POST /api/v1/articles', fn: echo},
        {req: 'DELETE /api/v1/articles/:uid', fn: echo},
        {req: 'ALL *', fn: page404},
    ]);

    await express_run(app);
}

async function echo(req, res)
{
    res.status(200).send(express_params(req));
}

async function page404(req, res)
{
    res.status(404).send(`Page not found: ${req.path}`);
}
EOF
```
