import amx from './amx';

function express_routes(app, routes)
{
    for (let i = 0, end = routes.length; i < end; ++i) {
        const route = routes[i];
        const [method, path] = route.req.split(' ');
        const fn = route.fn.default || route.fn; // allow require('./api/api_articles_get')
        app[method.toLowerCase()](path, amx((req, res) => fn(req, res, route, routes)));
    }
    return app;
}

export default express_routes;
