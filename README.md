# latest-release [![Build Status](https://travis-ci.org/ricardomatias/latest-release.svg?branch=master)](https://travis-ci.org/ricardomatias/latest-release)

> Download the latest release assets from any repo on github

![screencast](https://github.com/ricardomatias/latest-release/blob/master/latest-screencast.gif)


## Install

```
$ npm install --global @ricardomatias/latest-release
```

## Usage

```shell
	Usage
	  > latest-release [user/repo] [-p] [-d]

	Options
	  -d, --download  Download latest release  [Default: false]
	  -p, --pattern  RegExp pattern to identify which asset to download

	Examples
	  > latest-release sharkdp/pastel
	  # Latest release v0.5.3:
	  # > https://github.com/sharkdp/pastel/releases/download/v0.5.3/pastel-musl_0.5.3_amd64.deb
	  # > https://github.com/sharkdp/pastel/releases/download/v0.5.3/pastel-v0.5.3-x86_64-apple-darwin.tar.gz

	  > latest-release sharkdp/pastel -p darwin -d
	  # Downloading pastel-v0.5.3-x86_64-apple-darwin.tar.gz [::::::::::::::::::::::::::::::] 100% 0.0s
      # Asset written to disk!
```
