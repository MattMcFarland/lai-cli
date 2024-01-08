import didYouMean, {ReturnTypeEnums, ThresholdTypeEnums} from 'didyoumean2'
import {FilterType} from './commands/find.js'
import {convertObjectValuesToStrings} from './tools.js'
import lunr from 'lunr'

interface Indexable {
  [key: string]: any
}

// Client Schema for searching and table display

export interface ClientsideModelPresentationEntry extends ClientSideModelEntry {
  /**
   * The gallery ID is a concatenation of the gallery name and the model url.
   */
  galleryId: string // flag: --gallery, -g
  /**
   * The name of the model.
   */
  name: string // flag: --name -n
  /**
   * The license of the model.
   */
  license?: string // flag: --license, -l
  /**
   * The tags of the model.
   */
  tags?: string // flag: --tag -t
  /**
   * The urls of the model.
   * (this is a concatenation of the url and urls properties)
   */
  urls: string // flag: --url -u
  /**
   * The files of the model.
   * (this is a concatenation of the uri properties of the files)
   */
  files?: string // flag: --file -f
  /**
   * The overrides of the model.
   */
  overrides?: string // no flag is used for this.
}
interface ClientSideModelEntry extends Record<string, unknown> {
  id: string
}

export class SearchIndex<T extends Indexable> {
  private index: Map<string, T>
  private reverseLookup: Map<string, Set<string>>
  private content: Map<string, string>
  private dupeCount: number
  private registeredFilters: Set<string> = new Set()
  private lunrIndex?: lunr.Index

  constructor(data: T[]) {
    // Build index and reverse lookup
    this.index = new Map()
    // reverseLookup is a Map of Sets, where each Set contains the IDs of all items that match a given attribute value
    this.reverseLookup = new Map()
    // content is a Map of strings, where each string is a concatenation of all values in an item
    this.content = new Map()
    this.buildLunrIndex(data)

    this.dupeCount = 0
    data.forEach((item, index) => {
      // Generate a unique ID for each item in the index
      if (!item.id) {
        throw new Error(`Item at index ${index} does not have an id`)
      }
      if (this.index.has(item.id)) {
        this.dupeCount++
        //throw new Error(`Duplicate ID found: for ${item.galleryId}: ${item.id}, (current size: ${this.index.size}))`)
      }
      this.index.set(item.id, item)

      this.content.set(String(item.id), convertObjectValuesToStrings(item, ['id', 'name']).join(' ').toLowerCase())

      // Build reverse lookup for filterable attributes.
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'string' || Array.isArray(value)) {
          const values = Array.isArray(value) ? value : [value]
          values.forEach((val) => {
            const lookupKey = `${key}:${val}`.toLowerCase()
            const ids = this.reverseLookup.get(lookupKey) || new Set<string>()
            ids.add(String(item.id))
            this.reverseLookup.set(lookupKey, ids)
          })
        }
      })
    })
    if (this.dupeCount > 0) console.warn(`Duplicate ID count: ${this.dupeCount}`)
  }

  buildLunrIndex(data: T[]) {
    this.lunrIndex = lunr(function () {
      this.ref('id')
      this.field('name')
      this.field('tags')
      this.field('urls')
      this.field('files')
      this.field('overrides')
      this.field('license')
      this.field('galleryId')
      this.field('id')
      data.forEach((item) => {
        this.add(item)
      })
    })
  }

  registerFilter(filter: string) {
    this.registeredFilters.add(filter.toLowerCase())
  }
  lunrSearch(query: string): [T[], string[]] {
    if (!this.lunrIndex) {
      throw new Error('Lunr index is not available.')
    }

    const results = this.lunrIndex.search(query)

    // Initialize an empty set to hold the unique keys of matched fields
    const matchedFieldKeys = new Set<string>()

    // Loop over each result and inspect the matching fields
    results.forEach((result) => {
      Object.keys(result.matchData.metadata as Record<string, unknown>).forEach((term) => {
        Object.keys((result.matchData.metadata as Record<string, unknown>)[term] as Record<string, unknown>).forEach(
          (fieldName: string) => {
            matchedFieldKeys.add(fieldName) // Add the field name to the set
          },
        )
      })
    })

    // Convert the Set to Array since we want to return an array of matched field names
    const matchedKeys = Array.from(matchedFieldKeys)

    const items = results.map((result) => {
      const item = this.index.get(result.ref)
      if (!item) {
        throw new Error(`Item with reference ${result.ref} was not found.`)
      }
      return item
    })

    return [items, matchedKeys]
  }

  filter(filters: {[key: string]: string | boolean | undefined}): T[] {
    let resultIds = new Set<string>()

    // throw an error if a filter is not registered
    Object.keys(filters).forEach((key) => {
      if (!this.registeredFilters.has(key.toLowerCase())) {
        throw new Error(`Filter ${key} is not registered`)
      }
    })

    // Initially, assume we want to include all items
    let initialSet = true

    Object.entries(filters).forEach(([key, value]) => {
      // Skip filters that are not defined or have an empty value
      if (value === undefined || value === '') {
        return
      }

      const lookupKey = `${key}:${value}`.toLowerCase()
      const matchingIds = this.reverseLookup.get(lookupKey)

      if (matchingIds) {
        // For partial matches, union the sets. If initial set, assign directly.
        resultIds = initialSet ? new Set(matchingIds) : new Set([...resultIds].filter((id) => matchingIds.has(id)))
        initialSet = false
      } else {
        // If there is no matching ID for a given filter and it's the first filter,
        // that means there are no possible matches for that filter, so clear the resultIds
        if (initialSet) {
          resultIds.clear()
        }
        initialSet = false
      }
    })

    return Array.from(resultIds).map((id) => {
      const item = this.index.get(id)
      if (!item) {
        throw new Error(`Item not found for id: ${id}`)
      }
      return item
    })
  }

  getFilteredData(search_query: string | undefined, filters: FilterType | undefined): [T[], string[]] {
    let results = Array.from(this.index.values())
    let matchedKeys: string[] = []
    if (search_query) {
      const [searchResults, keyMatches] = this.lunrSearch(search_query)
      results = searchResults
      matchedKeys = keyMatches
    }
    const matchedIDs = new Set(results.map((item) => item.id))

    // Retrieve full items from index using combined unique IDs.
    results = Array.from(matchedIDs).map((id) => this.index.get(id)!)

    const activeFilters = Object.entries(filters || {}).filter(
      ([_, value]) => value !== undefined && value !== '' && this.registeredFilters.has(String(value).toLowerCase()),
    )

    if (activeFilters.length > 0) {
      const filteredResults = this.filter(filters!)
      // Apply filters to the previously obtained search results.
      results = results.filter((result) => filteredResults.includes(result))
    }
    const resultsArray = Array.isArray(results) ? results : [results]

    return [resultsArray, matchedKeys]
  }
}
