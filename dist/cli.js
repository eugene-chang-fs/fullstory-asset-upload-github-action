"use strict";
exports.__esModule = true;
var yargs = require("yargs");
var asset_1 = require("./asset");
var args = yargs
    .options('key', {
    alias: 'k',
    type: 'string',
    description: 'API key used to upload assets',
    demandOption: true
})
    .options('prefix', {
    alias: 'p',
    type: 'string',
    description: 'URL prefix for all resources',
    demandOption: true
})
    .option('globs', {
    type: 'string',
    description: 'A json array of globs (e.g. **/*.css) to upload',
    "default": '["**/*.css"]'
})
    .option('addendum', {
    type: 'string',
    description: 'A json representing additional key values to be set in the asset map; useful if you want to add variables',
    "default": '{}'
})
    .parse();
(0, asset_1.uploadAssetsAsync)(args.key, args.prefix, JSON.parse(args.globs), JSON.parse(args.addendum))
    .then(console.log)["catch"](console.error);
