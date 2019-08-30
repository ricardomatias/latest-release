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
