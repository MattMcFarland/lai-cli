# Lai(Local AI) CLI

MIT License

Lai was born out of a desire to simplify the process of interacting with models served up by [LocalAI](https://github.com/mudler/LocalAI), and was heavily inspired by the initial direction of using the
terminal to interact with the server in examples.  The main purpose of lai is to provide intuitive paths for search, download, and test of LLMs.  It mostly came from my own lack of skill using `jq` and `curl`, but
still wanting the ease and use of a CLI. 

Lai's speciality is to facilitate the exploration of AI models hosted (or accessible) via your favorite Local AI Server instance. The searching feature is powered by lunr (https://lunrjs.com), a lightweight search library providing a great search experience.  The data is then made even more accessible thanks to [OCLIF](https://oclif.io/)’s masterful UX framework which provides some handly tools for deailing with tabular data.


<!-- toc -->
* [Lai(Local AI) CLI](#lailocal-ai-cli)
* [Design Philosophy](#design-philosophy)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->


# Design Philosophy
Provide a human-centric CLI for interacting with LocalAI:

- interop with commands line grep and sed 
- proper stdout and stderr usage (hopefully)
- output of json, yaml, csv, or pretty cli table (thanks to [OCLIF](https://oclif.io/))
- helful hints, interactive prompts (when needed)
- search and filter powered by lunrjs
- add and test different models, include sending prompts, etc.
# Installation
## Download Release
1. Go to [Releases](https://github.com/MattMcFarland/lai-cli/releases/tag/1.0.0) and download the tarball that best fits your environment.
2. unpack/unzip the file, then add it to your PATHS variable.
 

# Usage
<!-- usage -->
```sh-session
$ lai COMMAND
running command...
$ lai (--version)
lai-cli/1.0.0 linux-x64 node-v20.10.0
$ lai --help [COMMAND]
USAGE
  $ lai COMMAND
...
```
<!-- usagestop -->

## Basic Searching with lai
With lai, you can perform basic searches to find models relevant to your interests or needs. Initiate a search by simply providing a keyword or phrase.

- Search for a specific lib, like "gpt4all"
- Use tags to filter out the noise (in my case `--tag=gguf` was quite important)
- Everything partial search with AND queries built in by default, `--name=13b.q3 --tag=dolly-15k` for example
- More advanced queries explained further.
### Example
Here's simple flow of finding then installing a model:
```shell
$ lai find "llama 7b" --tag=gguf
```
outputs a list of matches, imagine we see `huggingface@thebloke__tulu-7b-gguf__tulu-7b.q4_k_s.gguf`
```shell
$ lai add huggingface@thebloke__tulu-7b-gguf__tulu-7b.q4_k_s.gguf
```

---

## Refining Your Search
lai offers various flags to refine and filter the results of your search, helping you narrow down to more specific models or files.

- Specify the type of license using `--license`.
- Find models containing certain files with `--file`.
- Filter by tags attached to models using `--tag`.
- Limit results to models from a particular gallery with `--gallery`.
- Search within local models using `--local`.

```shell
$ lai find --license="MIT" --file="README.md" --tag="NLP"
```

---

## Advanced Filtering
For power users, lai provides advanced filtering capabilities to craft precise queries.

- Exclude terms from the search with `-`.
- Include mandatory terms with `+`.
- Use wildcards `*` for partial matches.
- Employ fuzzy matching with `~` for approximate results.
- Boost the importance of a term in the search results with `^`.

```shell
$ lai find "+LSTM -RNN *network*"
```

---

## Sorting and Output Control
Thanks to OCLIF, lai enables you to control how your search results are displayed, making it easier to view and analyze them.

- Choose the output format with `--output`. (json, csv, yaml)
- Decide which columns to display using `--columns`.
- Sort your search results based on properties like number of stars with `--sort`.
- Access extended information about each model with `--extended`.

```shell
$ lai find "GAN" --output=json --columns=name,files --sort=name
```

---

## Special Searches
Sometimes your search requires something extra; that's where lunr's special characters come into play.

- Use quotes for exact phrase matching.
- Leverage required terms with `+` to ensure they appear in the results.
- Exclude specific terms with `-` to remove unwanted hits.
- Embrace the flexibility of wildcard searches with `*`.
- Allow for typos or variations with fuzzy searching `~`.

```shell
$ lai find "\"minstrel\"" "+"accuracy -"deprecated" "*v2"
```



# Commands
<!-- commands -->
* [`lai add ID`](#lai-add-id)
* [`lai find [SEARCH]`](#lai-find-search)
* [`lai help [COMMANDS]`](#lai-help-commands)
* [`lai prompt <MODEL_NAME> -u [user-prompt] -s [system-prompt] [...flags] --help`](#lai-prompt-model_name--u-user-prompt--s-system-prompt-flags---help)
* [`lai status`](#lai-status)

## `lai add ID`

Install a model from a gallery or a URL

```
USAGE
  $ lai add ID [-a <value>] [-j] [-n <value>]

ARGUMENTS
  ID  Gallery ID or URL identifier of the model

FLAGS
  -a, --address=<value>  [default: 127.0.0.1:8080] Address of the Local AI server
  -j, --json             Output in JSON format
  -n, --name=<value>     Optional name for the installed model

DESCRIPTION
  Install a model from a gallery or a URL

  Install a model from a gallery or a URL

  To install a model from a gallery, use the following format: <GALLERY>@<MODEL_NAME> (e.g.,
  model-gallery@bert-embeddings)
  To install a model from a GitHub repository, use the following format: github:<USER>/<REPO>/<PATH_TO_MODEL_DEFINITION>
  (e.g., github:go-skynet/model-gallery/gpt4all-j.yaml)
  Consider trying this command: lai add github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j

EXAMPLES
  $ lai add github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j

  $ lai add TheBloke/dolphin-2.2.1-mistral-7B-GGUF/dolphin-2.2.1-mistral-7b.Q4_0.gguf --name mistral-7b

  $ lai add <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)

  $ lai add https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml --name openllama_3b
```

_See code: [dist/commands/add.ts](https://github.com/MattMcFarland/lai-cli/blob/v1.0.0/dist/commands/add.ts)_

## `lai find [SEARCH]`

Search for models, filtering by properties, with full or partial searching by text, phrase, etc. inclusion exclusion, anrd more

```
USAGE
  $ lai find [SEARCH] [-a <value>] [-c] [-g <value>] [-t <value>] [-l <value>] [-u <value>] [-n <value>]
    [-f <value>] [--columns <value> | ] [--sort <value>] [--filter <value>] [-x] [--no-header | [--csv | --no-truncate]]
    [-o json|csv|yaml |  |  | -j]

ARGUMENTS
  SEARCH  search-query

FLAGS
  -a, --address=<value>  [default: 127.0.0.1:8080] Address of the Local AI server
  -c, --local            search only local models
  -f, --file=<value>     search file [--file=.yaml] [--file=myfile.gguf]
  -g, --gallery=<value>  search gallery [--gallery=model-gallery@bert-embeddings] (can search both sides of the @
                         symbol)
  -j, --json             Output in JSON format
  -l, --license=<value>  search license [--license=apache-2.0]
  -n, --name=<value>     search name [--name=bert-embeddings] alias is argument (lai find bert-embeddings)
  -o, --output=<option>  output in a more machine friendly format
                         <options: json|csv|yaml>
  -t, --tag=<value>      search tag [--tag=language-model]
  -u, --url=<value>      search url [--url=/TheBloke]
  -x, --extended         show extra columns
      --columns=<value>  only show provided columns (comma-seperated)
      --csv              output in csv format [alias: --output=csv]
      --filter=<value>   filter property by partial string matching, ex: name=foo
      --no-header        hide table header from output
      --no-truncate      do not truncate output to fit screen
      --sort=<value>     [default: id] property to sort by (prepend ' - ' for descending)

DESCRIPTION
  Search for models, filtering by properties, with full or partial searching by text, phrase, etc. inclusion exclusion,
  anrd more

EXAMPLES
  $ lai find
```

_See code: [dist/commands/find.ts](https://github.com/MattMcFarland/lai-cli/blob/v1.0.0/dist/commands/find.ts)_

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

## `lai prompt <MODEL_NAME> -u [user-prompt] -s [system-prompt] [...flags] --help`

Send a prompt to the given <MODEL_NAME>

```
USAGE
  $ lai prompt <MODEL_NAME> -u [user-prompt] -s [system-prompt] [...flags] --help

ARGUMENTS
  MODEL_NAME  name of model to prompt

FLAGS
  -a, --address=<value>     [default: 127.0.0.1:8080] Address of the Local AI server
  -c, --char-limit=<value>  [default: 60] The maximum number of characters before truncation warning. truncate is
                            ignored when using JSON or when multiple choices are returned.
  -j, --json                Print the raw JSON response
  -r, --request             Print the curl command used to send the prompt
  -s, --system=<value>      [default: Finish the sentence in 10 words or less:] The system message to send to the model
  -t, --timeout=<value>     [default: 90] The maximum number of seconds to wait for a response
  -u, --user=<value>        (required) [default: Once upon a time, ] The user message to send to the model
      --assistant=<value>   The assistant message to send to the model

DESCRIPTION
  Send a prompt to the given <MODEL_NAME>

  Sends a quick prompt to a model, and returns the response.
  Use the -u and -s flags to customize the prompt.
  Use "lai status" to see a list of active models.
  Use the -h flag to see more options.

  Aliases: check, c, p

EXAMPLES
  Send default prompt to a model (good for testing)

    $ lai prompt lunademo

  Send a custom prompt to a model

    $ lai prompt lunademo --system "answer questions" --user "What is your name?"
```

_See code: [dist/commands/prompt.ts](https://github.com/MattMcFarland/lai-cli/blob/v1.0.0/dist/commands/prompt.ts)_

## `lai status`

Shows currently active models

```
USAGE
  $ lai status [-a <value>] [-j]

FLAGS
  -a, --address=<value>  [default: 127.0.0.1:8080] Address of the Local AI server
  -j, --json             Output in JSON format

DESCRIPTION
  Shows currently active models

EXAMPLES
  $ lai status
```

_See code: [dist/commands/status.ts](https://github.com/MattMcFarland/lai-cli/blob/v1.0.0/dist/commands/status.ts)_
<!-- commandsstop -->
