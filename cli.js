#!/usr/bin/env node
'use strict';

import meow from 'meow';
import chalkTemplate from 'chalk-template';
import latestRelease from './index.js';

const cli = meow(chalkTemplate`
	{yellow.bold Usage}
	  $ latest-release [user/repo] [-p] [-d]

	{yellow.bold Options}
	  -d, --download  Download latest release  [Default: false]
	  -p, --pattern  RegExp pattern to identify which asset to download

	{yellow.bold Examples}
	  $ {greenBright.bold latest-release} sharkdp/pastel
	  {green Latest release v0.5.3:}
	  {green > https://github.com/sharkdp/pastel/releases/download/v0.5.3/pastel-musl_0.5.3_amd64.deb}
	  {green > https://github.com/sharkdp/pastel/releases/download/v0.5.3/pastel-v0.5.3-x86_64-apple-darwin.tar.gz}

	  $ {greenBright.bold latest-release} sharkdp/pastel -p darwin -d
	  {green Downloading pastel-v0.5.3-x86_64-apple-darwin.tar.gz [::::::::::::::::::::::::::::::] 100% 0.0s}
	  {green Asset written to disk!}
`,
{
	importMeta: import.meta, // Add importMeta property
	flags: {
		download: {
			type: 'boolean',
			shortFlag: 'd',
			default: false,
		},
		pattern: {
			type: 'string',
			shortFlag: 'p',
		},
	},
},
);

const userRepo = cli.input.at(0);
const { pattern, download } = cli.flags;

if (!userRepo) {
	cli.showHelp();
}

latestRelease({ userRepo, pattern, download });
