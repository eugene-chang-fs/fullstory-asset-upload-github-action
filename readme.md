# FullStory Asset Upload Github Action

This is a github action that is intended to be used with FullStory Asset Uploading; it's a simplified version of the document covered [here](https://help.fullstory.com/hc/en-us/articles/4404129191575-Asset-Uploading-for-Web)

## Running CLI

You can run this script manually by running `dist/cli.js` file. The simplest case is the following:

`node /path/to/repo/dist/cli.js -k "your-api-key" -p "https://asset-prefix.com/assets/" --globs '["*.css", "*.png"]'`

This command should be run with your CWD being the directory that contains all the assets.

You can run the cli.js with `--help` (or without any parameters) to see what it accepts.

Please note that the relative path to the asset file is the path appended to the prefix; i.e. if the prefix is `https://asset-prefix.com/assets/`, and the relative path to a file is `styles/index.css`, then the key for the asset would be `https://asset-prefix.com/assets/styles/index.css`.
