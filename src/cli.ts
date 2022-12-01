import * as yargs from 'yargs';
import { uploadAssetsAsync } from './asset';

const args = yargs
    .options('key', {
        alias: 'k',
        type: 'string',
        description: 'API key used to upload assets',
        demandOption: true,
    })
    .options('prefix', {
        alias: 'p',
        type: 'string',
        description: 'URL prefix for all resources',
        demandOption: true,
    })
    .option('globs', {
        type: 'string',
        description: 'A json array of globs (e.g. **/*.css) to upload',
        default: '["**/*.css"]',
    })
    .option('addendum', {
        type: 'string',
        description: 'A json representing additional key values to be set in the asset map; useful if you want to add variables',
        default: '{}',
    })
    .parse();

uploadAssetsAsync(args.key, args.prefix, JSON.parse(args.globs), JSON.parse(args.addendum))
    .then(console.log)
    .catch(console.error);