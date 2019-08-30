#!/usr/bin/env node
'use strict';

const meow = require('meow');
const chalk = require('chalk');
const latestRelease = require('./');

const cli = meow(chalk`
	{yellow.bold Usage}
	  $ latest-release [user/repo] [-p] [-d]

	{yellow.bold Options}
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
	},
}
);

const [ userRepo ] = cli.input;
const { pattern, download } = cli.flags;

if (!userRepo) {
	cli.showHelp();
}

latestRelease({ userRepo, pattern, download });
