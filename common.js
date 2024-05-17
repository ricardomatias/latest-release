import chalk from 'chalk-template';

export const USAGE = chalk`
{yellow.bold Usage}
	$ latest-release [user/repo] [-p|--pattern] [-d|--download]
`;

export function getVersion(link, patt) {
	const matchVersion = link.match(patt);

	const { version } = (matchVersion.groups || {});

	return version;
}
