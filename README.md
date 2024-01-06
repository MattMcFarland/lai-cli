oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g lai-cli
$ lai COMMAND
running command...
$ lai (--version)
lai-cli/0.0.0 linux-x64 node-v20.10.0
$ lai --help [COMMAND]
USAGE
  $ lai COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`lai hello PERSON`](#lai-hello-person)
* [`lai hello world`](#lai-hello-world)
* [`lai help [COMMANDS]`](#lai-help-commands)
* [`lai plugins`](#lai-plugins)
* [`lai plugins:install PLUGIN...`](#lai-pluginsinstall-plugin)
* [`lai plugins:inspect PLUGIN...`](#lai-pluginsinspect-plugin)
* [`lai plugins:install PLUGIN...`](#lai-pluginsinstall-plugin-1)
* [`lai plugins:link PLUGIN`](#lai-pluginslink-plugin)
* [`lai plugins:uninstall PLUGIN...`](#lai-pluginsuninstall-plugin)
* [`lai plugins reset`](#lai-plugins-reset)
* [`lai plugins:uninstall PLUGIN...`](#lai-pluginsuninstall-plugin-1)
* [`lai plugins:uninstall PLUGIN...`](#lai-pluginsuninstall-plugin-2)
* [`lai plugins update`](#lai-plugins-update)

## `lai hello PERSON`

Say hello

```
USAGE
  $ lai hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/MattMcFarland/lai-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `lai hello world`

Say hello world

```
USAGE
  $ lai hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ lai hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/MattMcFarland/lai-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `lai help [COMMANDS]`

Display help for lai.

```
USAGE
  $ lai help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for lai.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/src/commands/help.ts)_

## `lai plugins`

List installed plugins.

```
USAGE
  $ lai plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ lai plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/src/commands/plugins/index.ts)_

## `lai plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ lai plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ lai plugins add

EXAMPLES
  $ lai plugins add myplugin 

  $ lai plugins add https://github.com/someuser/someplugin

  $ lai plugins add someuser/someplugin
```

## `lai plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ lai plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ lai plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/src/commands/plugins/inspect.ts)_

## `lai plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ lai plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ lai plugins add

EXAMPLES
  $ lai plugins install myplugin 

  $ lai plugins install https://github.com/someuser/someplugin

  $ lai plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/src/commands/plugins/install.ts)_

## `lai plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ lai plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ lai plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/src/commands/plugins/link.ts)_

## `lai plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ lai plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lai plugins unlink
  $ lai plugins remove

EXAMPLES
  $ lai plugins remove myplugin
```

## `lai plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ lai plugins reset
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/src/commands/plugins/reset.ts)_

## `lai plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ lai plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lai plugins unlink
  $ lai plugins remove

EXAMPLES
  $ lai plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/src/commands/plugins/uninstall.ts)_

## `lai plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ lai plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lai plugins unlink
  $ lai plugins remove

EXAMPLES
  $ lai plugins unlink myplugin
```

## `lai plugins update`

Update installed plugins.

```
USAGE
  $ lai plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.12/src/commands/plugins/update.ts)_
<!-- commandsstop -->
