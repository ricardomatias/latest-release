# latest-release [![Build Status](https://travis-ci.org/ricardomatias/latest-release.svg?branch=master)](https://travis-ci.org/ricardomatias/latest-release)

> Download the latest release assets from any repo on github

![screencast](https://github.com/ricardomatias/latest-release/blob/master/latest-screencast.gif)


## Install

```
$ npm install --global @ricardomatias/latest-release
```

## Usage

```
	Usage
	  $ latest-release [user/repo] [-p] [-d]

	Options
	  -d, --download  Download latest release  [Default: false]
	  -p, --pattern  RegExp pattern to identify which asset to download

	Examples
	  $ latest-release sharkdp/pastel
	  // lists all the package links from the latest release

	  $ latest-release sharkdp/pastel -p darwin -d
	  // downloads the package containing "darwin" in the filename
```
