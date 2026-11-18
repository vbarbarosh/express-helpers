const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ...js.configs.recommended,
        files: ['src/**/*.js', 'demos/**/*.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'commonjs',
            globals: {...globals.node, ...globals.mocha},
        },
        rules: {
            ...js.configs.recommended.rules,
            // Unused function params document callback signatures (express
            // (req, res, next), error handlers, ...) — only flag unused locals
            'no-unused-vars': ['error', {args: 'none', caughtErrors: 'none'}],
        },
    },
];
