import {Args, Command, Flags, ux} from '@oclif/core'

import {routes, BaseCommand} from '../system.js'
import {ClientsideModelPresentationEntry, SearchIndex} from '../SearchIndex.js'
import {convertObjectValuesToStrings, getUniqueHash} from '../tools.js'

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
  static description = 'describe the command here'

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

  static aliases = ['f', 'list']
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
          extended: flags.url ? false : matchedKeysString.includes('url') ? false : true,
        },
        files: {
          extended: flags.file ? false : matchedKeysString.includes('file') ? false : true,
        },
        overrides: {
          extended: matchedKeysString.includes('overrides') ? false : true,
        },
      },
      options,
    )
  }
}
