const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const urlRegex = require('url-regex');
const fetch = require('node-fetch');
const Progress = require('progress');
const MultiProgress = require('multi-progress')(Progress);
const { USAGE, getVersion } = require('./common');
const { MultiSelect } = require('enquirer');
const graceful = require('node-graceful');
const del = require('del');

const PROMPT_OPTS = {
	name: 'value',
	limit: 10,
	result(names) {
		return names.map((name) => this.find(name).value);
	},
};

const filesInTransit = [];

graceful.on('exit', (done, event, signal) => {
	if (filesInTransit.length) {
		console.log('\n');
		console.log(chalk`{green Bye!} Cleaning up the mess before exiting..`);
		del.sync(filesInTransit);
	}
});

const multiProgress = new MultiProgress(process.stderr);

async function downloadPackage(link) {
	const filename = path.basename(link);
	const filePath = path.join(process.cwd(), filename);

	filesInTransit.push(filePath);

	const dest = fs.createWriteStream(filePath);

	const res = await fetch(link);

	const len = parseInt(res.headers.get('Content-Length'));

	const progress = chalk`{green.bold Downloading} {yellow ${filename}} {green.bold [:bar]} :percent :etas`;

	let bar;

	return new Promise((resolve, reject) => {
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

		res.body.on('end', function() {
			const index = filesInTransit.indexOf(filePath);

			filesInTransit.splice(index, 1);

			resolve();
		});

		res.body.on('error', (error) => reject(error));

		res.body.pipe(dest);
	});
}

const latestRelease = async ({ userRepo, pattern = /.*/, download }) => {
	const url = `https://api.github.com/repos/${userRepo}/releases/latest`;
	const downloadUrl = `https://github.com/${userRepo}/releases/download/`;

	const patt = new RegExp(pattern);
	const pattUrls = new RegExp(downloadUrl);
	const pattVersion = new RegExp(/download\/(?<version>.*)\//);

	const res = await fetch(url);
	const text = await res.text();

	const matches = text.match(urlRegex());

	if (!matches.length) {
		console.log(chalk`{red Oops!} No matching releases found`);
		console.log(USAGE);
		return;
	}

	let links = matches.filter((link) => patt.test(link));

	if (pattern && links.length === 0) {
		console.log(''); // separator
		console.log(chalk`{red Oops!} No matching release found for ${pattern}`);
		console.log(USAGE);
		return;
	}

	if (links.length == 1) {
		const link = links[0];
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

	links = links.filter((link) => pattUrls.test(link));

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
			name: path.basename(link),
			value: link,
		}));

		const version = getVersion(links[0], pattVersion);

		const message = chalk`{green Pick which assets to download for} {yellow.bold ${version}}`;

		const prompt = new MultiSelect(Object.assign(PROMPT_OPTS, { choices, message }));


		console.log(''); // separator
		let assets = await prompt.run();
		console.log(''); // separator

		if (!assets.length) {
			console.log(chalk`{yellow Oops!} Guess we're not downloading anything today`);
			console.log(USAGE);

			return;
		}

		await Promise.all(assets.map(async (link) => {
			return await downloadPackage(link);
		}));

		console.log(chalk`{green.bold All assets written to disk!}`);
	} catch (err) {
		console.log(chalk`{red Oops!} Something went wrong`);
		console.error(err);
	}
};

module.exports = latestRelease;
