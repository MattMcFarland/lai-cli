
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
* [`lai a ID`](#lai-a-id)
* [`lai add ID`](#lai-add-id)
* [`lai check [FILE]`](#lai-check-file)
* [`lai help [COMMANDS]`](#lai-help-commands)
* [`lai i ID`](#lai-i-id)
* [`lai install ID`](#lai-install-id)
* [`lai list [FILE]`](#lai-list-file)
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
* [`lai status [FILE]`](#lai-status-file)

## `lai a ID`

You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a model from a URL or from a gallery.

```
USAGE
  $ lai a ID [-n <vlue>]

ARGUMENTS
  ID  Gallery ID or URL identifier of the model

FLAGS
  -n, --name=<value>  Optional name for the installed model

DESCRIPTION
  You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a
  model from a URL or from a gallery.

ALIASES
  $ lai install
  $ lai i
  $ lai a

EXAMPLES
  $ lai a github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j

  $ lai a TheBloke/dolphin-2.2.1-mistral-7B-GGUF/dolphin-2.2.1-mistral-7b.Q4_0.gguf --name magic

  $ lai a <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)

  $ lai a https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml
```

## `lai add ID`

You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a model from a URL or from a gallery.

```
USAGE
  $ lai add ID [-n <value>]

ARGUMENTS
  ID  Gallery ID or URL identifier of the model

FLAGS
  -n, --name=<value>  Optional name for the installed model

DESCRIPTION
  You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a
  model from a URL or from a gallery.

ALIASES
  $ lai install
  $ lai i
  $ lai a

EXAMPLES
  $ lai add github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j

  $ lai add TheBloke/dolphin-2.2.1-mistral-7B-GGUF/dolphin-2.2.1-mistral-7b.Q4_0.gguf --name magic

  $ lai add <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)

  $ lai add https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml
```

_See code: [dist/commands/add.ts](https://github.com/MattMcFarland/lai-cli/blob/v0.0.0/dist/commands/add.ts)_

## `lai check [FILE]`

describe the command here

```
USAGE
  $ lai check [FILE] [-n <value>] [-f]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ lai check
```

_See code: [dist/commands/check.ts](https://github.com/MattMcFarland/lai-cli/blob/v0.0.0/dist/commands/check.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/lib/commands/help.ts)_

## `lai i ID`

You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a model from a URL or from a gallery.

```
USAGE
  $ lai i ID [-n <value>]

ARGUMENTS
  ID  Gallery ID or URL identifier of the model

FLAGS
  -n, --name=<value>  Optional name for the installed model

DESCRIPTION
  You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a
  model from a URL or from a gallery.

ALIASES
  $ lai install
  $ lai i
  $ lai a

EXAMPLES
  $ lai i github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j

  $ lai i TheBloke/dolphin-2.2.1-mistral-7B-GGUF/dolphin-2.2.1-mistral-7b.Q4_0.gguf --name magic

  $ lai i <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)

  $ lai i https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml
```

## `lai install ID`

You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a model from a URL or from a gallery.

```
USAGE
  $ lai install ID [-n <value>]

ARGUMENTS
  ID  Gallery ID or URL identifier of the model

FLAGS
  -n, --name=<value>  Optional name for the installed model

DESCRIPTION
  You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a
  model from a URL or from a gallery.

ALIASES
  $ lai install
  $ lai i
  $ lai a

EXAMPLES
  $ lai install github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j

  $ lai install TheBloke/dolphin-2.2.1-mistral-7B-GGUF/dolphin-2.2.1-mistral-7b.Q4_0.gguf --name magic

  $ lai install <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)

  $ lai install https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml
```

## `lai list [FILE]`

describe the command here

```
USAGE
  $ lai list [FILE] [-n <value>] [-f]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ lai list
```

_See code: [dist/commands/list.ts](https://github.com/MattMcFarland/lai-cli/blob/v0.0.0/dist/commands/list.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/index.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/inspect.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/install.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/link.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/reset.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/uninstall.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.14/lib/commands/plugins/update.ts)_

## `lai status [FILE]`

describe the command here

```
USAGE
  $ lai status [FILE] [-n <value>] [-f]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ lai status
```

_See code: [dist/commands/status.ts](https://github.com/MattMcFarland/lai-cli/blob/v0.0.0/dist/commands/status.ts)_
<!-- commandsstop -->
