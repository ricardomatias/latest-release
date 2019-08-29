#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const meow = require('meow');
const chalk = require('chalk');
const urlRegex = require('url-regex');
const fetch = require('node-fetch');
const ProgressBar = require('progress');

const cli = meow(`
	Usage
	  $ latest-release [user/repo] [-p] [-d]

	Options
	  -d, --download  Download latest release  [Default: false]
	  -p, --pattern  RegExp pattern to identify which asset to download

	Examples
	  $ latest-release sharkdp/pastel
	  // lists all the assets links from the latest release

	  $ latest-release sharkdp/pastel -p darwin -d
	  // downloads the assets containing "darwin" in the filename
`, {
		flags: {
			download: {
				type: 'boolean',
				alias: 'd',
				default: false,
			},
			pattern: {
				type: 'string',
				alias: 'p'
			}
		}
	}
);
const USAGE = chalk`
{bold USAGE}
	$ latest-release [user/repo] [-p] [-d]
`;

const TEST_URL = 'http://cachefly.cachefly.net/100mb.test';
const [ userRepo ] = cli.input;
const { pattern, download } = cli.flags;

// separator
console.log('');

if (!userRepo) {
	console.log(chalk`{yellow [warning] user/repo missing}`);

	console.log(USAGE);

	return;
}

const url = `https://api.github.com/repos/${userRepo}/releases/latest`;
const downloadUrl = `https://github.com/${userRepo}/releases/download/`

const patt = new RegExp(pattern);
const pattUrls = new RegExp(downloadUrl);

async function downloadPackage(link) {
	const filename = path.basename(link);
	const filePath = path.join(__dirname, filename);

	const dest = fs.createWriteStream(filePath);

	const res = await fetch(link);

	const len = parseInt(res.headers.get('Content-Length'));

	const progress = chalk`{green.bold Downloading} {yellow ${filename}} {green.bold [:bar]} :percent :etas`;

	const bar = new ProgressBar(progress, {
		complete: ':',
		incomplete: ' ',
		width: 20,
		total: len
	});

	res.body.on('data', function(chunk) {
		bar.tick(chunk.length);
	});

	res.body.pipe(dest);
}

async function main() {
	const res = await fetch(url);
	const text = await res.text();

	const matches = text.match(urlRegex());

	if (!matches.length) {
		console.log(chalk`{red [error]} No matching releases found`);
		console.log(USAGE);
		return;
	}

	const link = matches.find((link) => patt.test(link));
	const links = matches.filter((link) => pattUrls.test(link));

	if (!links.length) {
		console.log(chalk`{red [error]} No matching releases found`);
		console.log(USAGE);
		return;
	}

	if (!link) {
		console.log(chalk`{red [error]} No matching releases found`);
		console.log(USAGE);
		return;
	}

	if (!pattern) {
		console.log(chalk`{green Latest releases: }
	* ${links.join(`\n \t* `)}`);
		return;
	}

	if (download) {
		downloadPackage(link);
	} else {
		console.log(chalk`{green Latest release: }${link}`);
	}
}

main();
