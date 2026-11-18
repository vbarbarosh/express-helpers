const Promise = require('bluebird');

function express_run(app, port = 3000, host = 'localhost')
{
    const server = app.listen(port, host, function (error) {
        // Express 5 calls back with a listen error too (EADDRINUSE, ...):
        // the promise below rejects with it
        if (error) {
            return;
        }
        const {address, port} = this.address();
        console.log(`[express_run] Listening to ${address}:${port}`);
    });

    // https://joseoncode.com/2014/07/21/graceful-shutdown-in-node-dot-js/
    // process.on('SIGTERM', sigterm);
    // process.on('SIGINT', sigint);
    //
    // server.on('close', function () {
    //     console.log(`[express_run] end`);
    //     process.off('SIGTERM', sigterm);
    //     process.off('SIGINT', sigint);
    // });
    //
    // function sigterm() {
    //     console.log('[express_run] SIGTERM');
    //     server.close();
    // }
    //
    // function sigint() {
    //     console.log('[express_run] SIGINT');
    //     server.close();
    // }

    // return pending(cb => server.once('close', cb));
    return new Promise(function (resolve, reject) {
        server.once('close', resolve);
        server.once('error', reject);
    });
}

module.exports = express_run;
