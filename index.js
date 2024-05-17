import { createWriteStream } from 'fs';
import { basename, join } from 'path';
import chalk from 'chalk-template';
import fetch from 'node-fetch';
import MultiProgress from 'multi-progress';
import { USAGE, getVersion } from './common.js';
import urlRegexSafe from 'url-regex-safe';
// @ts-ignore
import Enquirer from 'enquirer';
import Graceful from 'node-graceful';
import { deleteSync } from 'del';


Graceful.captureExceptions = true;

const enquirer = new Enquirer();

const PROMPT_OPTS = {
	type: 'multiselect',
	name: 'value',
	limit: 10,
	result(names) {
		return names.map((name) => this.find(name).value);
	},
};

const filesInTransit = [];

// @ts-ignore
Graceful.on('exit', (done, event, signal) => {
	if (filesInTransit.length) {
		console.log('\n');
		console.log(chalk`{green Bye!} Cleaning up the mess before exiting..`);
		deleteSync(filesInTransit);
	}
});

const multiProgress = new MultiProgress();

async function downloadPackage(link) {
	const filename = basename(link);
	const filePath = join(process.cwd(), filename);

	filesInTransit.push(filePath);

	const dest = createWriteStream(filePath);

	const res = await fetch(link);

	if (!res.ok || res.body === null) {
		const text = await res.text();
		throw new Error(text);
	}

	const contentLength = res.headers.get('content-length') ?? "0";

	const len = parseInt(contentLength);

	const progress = chalk`{green.bold Downloading} {yellow ${filename}} {green.bold [:bar]} :percent :etas`;

	let bar;

	return new Promise((resolve, reject) => {
		// @ts-ignore
		res.body.on('data', function(chunk) {
			if (!bar) {
				bar = multiProgress.newBar(progress, {
					head: '>',
					complete: ':',
					incomplete: ' ',
					width: 30,
					total: len,
				});
			}

			if (bar.tick) {
				bar.tick(chunk.length);
			}
		});

		// @ts-ignore
		res.body.on('end', function() {
			const index = filesInTransit.indexOf(filePath);

			filesInTransit.splice(index, 1);

			// @ts-ignore
			resolve();
		});

		// @ts-ignore
		res.body.on('error', (error) => reject(error));

		// @ts-ignore
		res.body.pipe(dest);
	});
}

const latestRelease = async ({ userRepo, pattern, download }) => {
	const url = `https://api.github.com/repos/${userRepo}/releases/latest`;
	const downloadUrl = `https://github.com/${userRepo}/releases/download/`;

	const patt = new RegExp(pattern);
	const pattUrls = new RegExp(downloadUrl);
	const pattVersion = new RegExp(/download\/(?<version>.*)\//);

	const res = await fetch(url);
	const text = await res.text();
	const matches = text.match(urlRegexSafe());

	if (matches === null || !matches.length) {
		console.log(chalk`{red Oops!} No matching releases found`);
		console.log(USAGE);
		return;
	}

	let link;

	if (pattern) {
		link = matches.find((link) => patt.test(link));

		if (!link) {
			console.log(''); // separator
			console.log(chalk`{red Oops!} No matching release found for ${pattern}`);
			console.log(USAGE);
			return;
		}

		const version = getVersion(link, pattVersion);

		if (download) {
			await downloadPackage(link);
			console.log(chalk`{green.bold Asset written to disk!}`);
		} else {
			console.log(''); // separator
			if (version) {
				console.log(chalk`{green Latest release} {bold.yellow ${version}}:\n> ${link}`);
			} else {
				console.log(chalk`{green Latest release: }${link}`);
			}
		}
		return;
	}

	const links = matches.filter((link) => pattUrls.test(link));

	if (!links.length) {
		console.log(chalk`{red Oops!} No assets found to download`);
		console.log(USAGE);
		return;
	}


	if (!download) {
		const version = getVersion(links[0], pattVersion);

		console.log(''); // separator
		console.log(chalk`{green Latest release }{yellow.bold ${version}}:`);
		console.log(`> ${links.join(`\n> `)}`);
		return;
	}

	try {
		const choices = links.map((link) => ({
			name: basename(link),
			value: link,
		}));

		const version = getVersion(links[0], pattVersion);

		const message = chalk`{green Pick which assets to download for} {yellow.bold ${version}}`;

		console.log(''); // separator
		// @ts-ignore
		let {value} = await enquirer.prompt(Object.assign(PROMPT_OPTS, { choices, message }));
		console.log(''); // separator

		if (!value.length) {
			console.log(chalk`{yellow Oops!} Guess we're not downloading anything today`);
			console.log(USAGE);

			return;
		}

		await Promise.all(value.map(async (link) => {
			return downloadPackage(link);
		}));

		console.log(chalk`{green.bold All assets written to disk!}`);
	} catch (err) {
		console.log(chalk`{red Oops!} Something went wrong`);
		console.error(err);
	}
};

export default latestRelease;
