#!/usr/bin/env node
'use strict';

const meow = require('meow');
const chalk = require('chalk');
const latestRelease = require('./');

const cli = meow(chalk`
	{yellow.bold Usage}
	  $ latest-release [-c] [user/repo] [-p] [-d]

	{yellow.bold Options}
	  -c, Check if there are any new versions from the previously downloaded artifacts  [Default: false]
	  -d, --download  Download latest release  [Default: false]
	  -p, --pattern  RegExp pattern to identify which asset to download

	{yellow.bold Examples}
	  $ {green.bold latest-release} sharkdp/pastel
	  {grey Latest release v0.5.3:}
	  {grey > https://github.com/sharkdp/pastel/releases/download/v0.5.3/pastel-musl_0.5.3_amd64.deb}
	  {grey > https://github.com/sharkdp/pastel/releases/download/v0.5.3/pastel-v0.5.3-x86_64-apple-darwin.tar.gz}

	  $ {green.bold latest-release} sharkdp/pastel -p darwin -d
	  {grey Downloading pastel-v0.5.3-x86_64-apple-darwin.tar.gz [::::::::::::::::::::::::::::::] 100% 0.0s}
	  {grey Asset written to disk!}
`, {
	flags: {
		download: {
			type: 'boolean',
			alias: 'd',
			default: false,
		},
		pattern: {
			type: 'string',
			alias: 'p',
		},
		checkUpdates: {
			type: 'boolean',
			default: false,
			alias: 'c'
		},
	},
}
);

const [ userRepo ] = cli.input;
const { pattern, download, checkUpdates } = cli.flags;

// CHECK UPDATES
// * re-use latestRelease function
// * add a flag to avoid the confirmation prompt if the latest and the previously downloaded version are the same
if (checkUpdates) {

}

if (!userRepo) {
	cli.showHelp();
}

latestRelease({ userRepo, pattern, download, checkUpdates });
