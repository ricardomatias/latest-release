const chalk = require('chalk');

exports.USAGE = chalk`
{yellow.bold Usage}
	$ latest-release [user/repo] [-p|--pattern] [-d|--download]
`;

exports.getVersion = (link, patt) => {
	const matchVersion = link.match(patt);

	const { version } = (matchVersion.groups || {});

	return version;
};

exports.findRepo = (config, userRepo) => {
	return config.get('repos').find((repo) => repo.name === userRepo);
};

exports.updateRepo = (config, userRepo, data) => {
	const repos = config.get('repos');
	const index = repos.findIndex((repo) => repo.name === userRepo);

	repos.splice(index, 1);

	config.set('repos', [...repos, data]);
};

