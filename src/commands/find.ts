import {Args, Command, Flags, ux} from '@oclif/core'

import {routes, BaseCommand} from '../system.js'
import {ClientsideModelPresentationEntry, SearchIndex} from '../SearchIndex.js'
import {convertObjectValuesToStrings, getUniqueHash} from '../tools.js'
import {get} from 'http'

interface Hint {
  topic: string
  message: string
}

export interface FilterType {
  tag?: string
  license?: string
  url?: string
  name?: string
  file?: string
  gallery?: string
  local?: boolean
  id?: string
  [key: string]: string | boolean | undefined
}

interface ServersideModelEntry extends Record<string, unknown> {
  /**
   * The URL associated with the model, typically a GitHub repository.
   */
  url: string
  /**
   * The unique ID of the model, following a specific naming convention.
   * <gallery>@<model-name>
   */
  id: string
  /**
   * A unique name for the model, following a specific naming convention.
   * It usually includes the creator's name, model type, version, and other relevant details.
   */
  name: string

  /**
   * An array of URLs, generally pointing to resources or additional information about the model.
   * Typically includes links to hosting platforms like Hugging Face.
   */
  urls?: string[]

  /**
   * Tags associated with the model, providing metadata such as region, model capabilities, or relevant identifiers like arXiv references.
   */
  tags?: string[]

  /**
   * Contains license for using this model.
   */
  license: string

  /**
   * Overrides provide specific parameter configurations for the model.
   * This could include specific file references or configuration tweaks.
   */
  overrides?: {
    parameters: {
      [key: string]: string
    }
  }

  /**
   * Files associated with the model, including their filenames, SHA256 hashes for verification, and URIs for accessing these files.
   */
  files?: ServersideFileEntry[]

  /**
   * Reference to the gallery where the model is showcased or further described.
   */
  gallery: ServersideGalleryEntry
}
/**
 * Represents a file associated with a model entry.
 */
interface ServersideFileEntry extends Record<string, unknown> {
  filename: string
  sha256: string
  uri: string
}

/**
 * Represents a gallery reference in a model entry.
 */
interface ServersideGalleryEntry extends Record<string, unknown> {
  url: string
  name: string
}

export default class Find extends BaseCommand {
  static description =
    'Search for models, filtering by properties, with full or partial searching by text, phrase, etc. inclusion exclusion, anrd more'

  static examples = ['<%= config.bin %> <%= command.id %>']
  static args = {
    search: Args.string({description: 'search-query', required: false}),
  }
  static flags = {
    local: Flags.boolean({
      char: 'c',
      description: 'search only local models',
      default: false,
      required: false,
    }),
    json: Flags.boolean({
      char: 'j',
      description: 'Output in JSON format',
      default: false,
      required: false,
    }),

    gallery: Flags.string({
      char: 'g',
      description: 'search gallery [--gallery=model-gallery@bert-embeddings] (can search both sides of the @ symbol)',
      default: '',
      required: false,
    }),
    tag: Flags.string({
      char: 't',
      description: 'search tag [--tag=language-model]',
      default: '',
      required: false,
    }),
    license: Flags.string({
      char: 'l',
      description: 'search license [--license=apache-2.0]',
      default: '',
      required: false,
    }),
    url: Flags.string({
      char: 'u',
      description: 'search url [--url=/TheBloke]',
      default: '',
      required: false,
    }),
    name: Flags.string({
      char: 'n',
      description: 'search name [--name=bert-embeddings] alias is argument (lai find bert-embeddings)',
      default: '',
      required: false,
    }),
    file: Flags.string({
      char: 'f',
      description: 'search file [--file=.yaml] [--file=myfile.gguf]',
      default: '',
      required: false,
    }),
    columns: Flags.string({exclusive: ['additional'], description: 'only show provided columns (comma-seperated)'}),
    sort: Flags.string({description: "property to sort by (prepend ' - ' for descending)", default: 'id'}),
    filter: Flags.string({description: 'filter property by partial string matching, ex: name=foo'}),
    csv: Flags.boolean({description: 'output in csv format [alias: --output=csv]', exclusive: ['no-truncate']}),
    extended: Flags.boolean({char: 'x', description: 'show extra columns'}),
    'no-truncate': Flags.boolean({exclusive: ['csv'], description: 'do not truncate output to fit screen'}),
    'no-header': Flags.boolean({exclusive: ['csv'], description: 'hide table header from output'}),
    output: Flags.string({
      char: 'o',
      description: 'output in a more machine friendly format',
      exclusive: ['no-truncate', 'csv', 'json'],
      options: ['json', 'csv', 'yaml'],
    }),
  }

  static topic = 'find'

  static preprocessModelEntry(entry: ServersideModelEntry): ClientsideModelPresentationEntry {
    return {
      id: getUniqueHash(`${entry.gallery.name}@${entry.name}`),
      name: entry.name,
      license: entry.license,
      tags: entry.tags?.join(', '), // Convert tags array to comma-separated string
      urls: [entry.url, ...(entry.urls || [])].join(', '), // Combine url and urls into one string
      files: entry.files?.map((file) => file.uri).join(', '), // Extract the URIs from the files
      overrides: JSON.stringify(entry.overrides), // Convert overrides object to a string
      galleryId: `${entry.gallery.name}@${entry.name}`, // Generate galleryId as specified
    }
  }
  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Find)

    const filters: FilterType = {
      tag: flags.tag,
      license: flags.license,
      url: flags.url,
      name: flags.name,
      file: flags.file,
      gallery: flags.gallery,
    }

    const options = {
      columns: flags.columns,
      sort: flags.sort,
      csv: flags.output === 'csv',
      extended: flags.extended,
      'no-truncate': flags['no-truncate'],
      'no-header': flags['no-header'],
      output: flags.json ? 'json' : flags.output,
    }

    const response = await this.connect.get<ServersideModelEntry[]>(routes.models_available)
    const models = response.data

    // Initial pass: Here we filter based on local flag. Which can reduce the number of models the most when enabled.
    // This can reduce the number of models from 30,000 to 30. This is a huge performance boost.
    const localModels = response.data.filter((model) => model.name.includes('localmodels'))
    const modelData = flags.local ? localModels : models
    const modelEntries = modelData.map(Find.preprocessModelEntry)

    const searchIndex = new SearchIndex(modelEntries)

    // Register filters
    for (const filter of Object.keys(filters)) {
      if (filter) {
        searchIndex.registerFilter(filter)
      }
    }

    const [searchResults, matchedKeys] = searchIndex.getFilteredData(args.search, filters)
    const matchedKeysString = matchedKeys.join(', ')
    console.log('searchResults', searchResults.length)

    // extended:true means to hide unless (--extended) is used.  extended:False alwways shows.
    ux.table<any>(
      searchResults,
      {
        galleryId: {
          extended: false,
        },
        name: {
          extended: true,
        },
        license: {
          extended: flags.license ? false : matchedKeysString.includes('license') ? false : true,
        },
        tags: {
          extended: flags.tag ? false : matchedKeysString.includes('tag') ? false : true,
        },
        urls: {
          extended: flags.url ? false : true,
        },
        files: {
          extended: true,
        },
        overrides: {
          extended: true,
        },
      },
      options,
    )

    this.log(`\n${searchResults.length} models found.`)
    this.log(`matches found in: ${matchedKeysString}  `)
    this.log(`use --extended to see all columns.  `)
    this.log(this.quickhint())
  }

  quickhint(): string {
    return this.hint(this.getRandomHint(this.hints))
  }
  getRandomHint(hints: Hint[]): Hint {
    const randomIndex = Math.floor(Math.random() * hints.length)
    return hints[randomIndex]
  }

  hint(hint: Hint): string {
    const {topic, message} = hint
    return `${ux.colorize('bold', topic)}: ${message}`
  }
  hints = [
    {topic: 'Local Models First', message: 'Quickly find local models by using the -c or --local flag.'},
    {topic: 'Direct URL Access', message: 'Finding models from a known URL? Try --url=<url-string>!'},
    {topic: 'File Specific Search', message: 'If you need a model with a particular file, use --file=<filename>.'},
    {topic: 'Quick JSON Output', message: 'Get results in JSON format swiftly with -j or --json.'},
    {
      topic: 'CSV for Spreadsheets',
      message: 'Export your search results to CSV using --csv flag for easy spreadsheet use.',
    },
    {topic: 'Adjusting Visibility', message: 'Reduce column output using --columns=<col1,col2,...>.'},
    {topic: 'Sorting Results', message: 'Order your search results with --sort=<property-name>.'},
    {
      topic: 'Partial String Matching',
      message: 'Use the filter flag for substring matching like --filter name=partofname.',
    },
    {topic: 'Full Display', message: 'Prevent truncation and show full output with --no-truncate.'},
    {topic: 'Cleaner Tables', message: 'Hide table headers in output using --no-header.'},
    {topic: 'Alternative Outputs', message: 'Besides JSON and CSV, you can also export to YAML with --output=yaml.'},
    {topic: 'Search Shortcuts', message: "Remember the aliases, 'f' or 'list', for quick command access."},
    {topic: 'Dynamic Searches', message: 'Combine flags for complex searches, such as --tag NLP --license MIT.'},
    {
      topic: 'Exploring Overrides',
      message: 'sarch overrides with `lai find "overrides:term"` to find models with specific overrides.',
    },
    {
      topic: 'Refine Your Results',
      message: 'Chain filters together to narrow down your search, like --gallery mygallery --file .yaml.',
    },
    {
      topic: 'Require Terms',
      message:
        'Use a plus sign to narrow down your search. Example: `lai find "+vicuna +lora"` finds entries containing both "vicuna" and "lora".',
    },
    {
      topic: 'Exclude Terms',
      message:
        'A minus sign excludes terms. Example: `lai find "-llama +pytorch"` finds entries containing "pytorch" but not "llama".',
    },
    {
      topic: 'Partial Matches',
      message:
        'Filters use partial matches by default, so `lai find model --name=beluga` will match all models with "beluga" in their name.',
    },
    {
      topic: 'Combine Filters',
      message:
        'You can combine filters for precision. Example: `lai find "+tag:facebook +tag:meta"` finds all Meta models using PyTorch.',
    },
    {
      topic: 'Wildcard Searches',
      message:
        'Asterisks act as wildcards. Example: `lai find "*gpt*"` will match any entry with "gpt" anywhere in the text.',
    },
    {
      topic: 'Phrase Searches',
      message:
        'Quotation marks search for exact phrases. Example: `lai find "\\"text generation\\""` searches for the exact phrase "text generation".',
    },
    {
      topic: 'Fuzzy Searches',
      message:
        'Tilde allows fuzzy matching. Example: `lai find "modle~1"` will match "model" with a one character difference tolerated.',
    },
    {
      topic: 'Boosting Terms',
      message:
        'Caret boosts the importance of a term. Example: `lai find "pytorch^5 llama"` prioritizes "pytorch" over "llama".',
    },
    {
      topic: 'Filter on Multiple Values',
      message:
        'Use the search argument to search on multiple tags. Example: `lai find "tag:en tag:es"` finds models supporting both English and Spanish.',
    },
    {
      topic: 'Multiple Filter Types',
      message:
        'Different flags filter different columns. Example: `lai find --license=mit --tag=dolly` finds MIT licensed models trained on the "dolly" dataset.',
    },
  ]
}
