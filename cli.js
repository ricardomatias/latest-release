#!/usr/bin/env node
'use strict';

const meow = require('meow');
const chalk = require('chalk');
const latestRelease = require('./');
const { USAGE } = require('./common');

const cli = meow(chalk`
	{yellow.bold Usage}
	  $ latest-release [user/repo] [-p] [-d]

	{yellow.bold Options}
	  -d, --download  Download latest release  [Default: false]
	  -p, --pattern  RegExp pattern to identify which asset to download

	{yellow.bold Examples}
	  $ {green.bold latest-release} sharkdp/pastel
	  {grey # lists all the assets links from the latest release}

	  $ {green.bold latest-release} sharkdp/pastel -p darwin -d
	  {grey # downloads the assets containing "darwin" in the filename}
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
	},
}
);

const [ userRepo ] = cli.input;
const { pattern, download } = cli.flags;

if (!userRepo) {
	cli.showHelp();
}

latestRelease({ userRepo, pattern, download });
