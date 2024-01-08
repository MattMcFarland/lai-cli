import {Errors} from '@oclif/core'
import * as crypto from 'crypto'
import Joi from 'joi'
import didYouMean, {ReturnTypeEnums, ThresholdTypeEnums} from 'didyoumean2'

// use ReturnTypeEnums.ALL_SORTED_MATCHES to get all matches
export function findSimilarStrings(target: string, candidates: string[], limit: number = 4): string[] {
  return didYouMean(target, candidates, {
    caseSensitive: false,
    returnType: ReturnTypeEnums.ALL_SORTED_MATCHES,
    thresholdType: ThresholdTypeEnums.SIMILARITY,
    threshold: 0,
  }).slice(0, limit)
}

const modelDefinitionUriSchema = Joi.string().custom((value, helpers) => {
  function determineUriIssue(uri: string) {
    if (!uri.includes('.')) {
      return 'The URI should contain a domain name or file extension.'
    }
    if (uri.split('://').length > 2) {
      return "The protocol appears to be broken; make sure it's formatted correctly (e.g., 'http://' or 'https://')."
    }
    // Add more checks based on common URI errors you wish to report

    return 'Check the overall structure of the URI.'
  }

  const uriPattern = new RegExp(
    '^(?:[\\w]+:\\/\\/)?' + // Optional protocol
      '(?:(?:(?:[\\w\\-\\.]+)\\/)*' + // Optional subdirectories
      '(?:[\\w\\-\\.]+))' + // Required final directory or file
      '(?:\\/[\\s]*)?$', // Optional trailing slash(es)
  )

  if (uriPattern.test(value)) {
    return value // Return the original value if it's valid
  } else {
    const messageDetail = determineUriIssue(value) // Custom function to determine the specific issue

    // Provide a contextual error message with hints
    return helpers.error('any.invalid', {
      message: `Invalid URI format: ${messageDetail}`,
    })
  }
}, 'URI Validation')

const galleryIdSchema = Joi.string().custom((value, helpers) => {
  const galleryIdRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*@[a-z0-9]+(?:-[a-z0-9]+)*$/i

  if (galleryIdRegex.test(value)) {
    return value
  } else {
    throw new Error('Invalid Gallery ID Format')
  }
}, 'Gallery ID Validation')

const githubUrlSchema = Joi.string().regex(/^github:[a-zA-Z0-9]+(\/[a-zA-Z0-9\-_\.]+){2,}$/, 'GitHub URL Validation')

export const modelInstallationRequestSchema = Joi.object({
  id: galleryIdSchema,
  url: Joi.alternatives().try(modelDefinitionUriSchema, githubUrlSchema),
  name: Joi.string().optional(),
})
  .xor('id', 'url')
  .required()

export function getUniqueHash(str: string): string {
  const sha256Hash = crypto.createHash('sha256').update(str).digest()

  // Encode the binary hash as base64
  const base64Hash = sha256Hash.toString('base64')

  // Optionally replace standard base64 characters that are not URL-safe if needed.
  const urlSafeBase64Hash = base64Hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  return urlSafeBase64Hash
}
// Convert all values in an object to strings and return them as an array
// this is for the search!!
export function convertObjectValuesToStrings(obj: any, excludeKeys: string[] = []): string[] {
  let result: string[] = []

  function recurse(currentObj: any) {
    for (let key in currentObj) {
      if (currentObj.hasOwnProperty(key)) {
        const value = currentObj[key]
        if (typeof value === 'object' && value !== null) {
          recurse(value)
        } else {
          if (excludeKeys.includes(key)) continue
          result.push(String(value))
        }
      }
    }
  }

  recurse(obj)

  return result.reduce((acc, curr) => {
    if (curr === 'null' || curr === 'undefined' || !curr || !curr.trim()) return acc
    return [...acc, curr.trim()]
  }, [] as string[])

  // .forEach((value, index) => {
  //   if (value === 'null' || value === 'undefined') result[index] = ''
  // })
  return result.join('\n').toLowerCase().split(' ')
}

function extractTopKeywords(text: string): string[] {
  // Normalize text to lowercase and remove non-alphabetic characters
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/gi, '')

  // Split text into words
  const words = normalizedText.split(/\s+/)

  // Count frequency of each word using a map object
  const frequencyMap: Record<string, number> = words.reduce((map: Record<string, number>, word: string) => {
    map[word] = (map[word] || 0) + 1
    return map
  }, {})

  // Create pairs [word, count] and sort by count in descending order
  const sortedWords: [string, number][] = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1])

  // Extract the top 3 words
  const topKeywords: string[] = sortedWords.slice(0, 3).map((entry) => entry[0])

  return topKeywords
}
