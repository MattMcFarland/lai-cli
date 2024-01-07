import {Errors} from '@oclif/core'

import Joi from 'joi'
import {BaseCommand} from './system.js'

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

export function handleCommonErrors(commandInstance: BaseCommand, error: any) {
  if (error.code === 'ECONNREFUSED') {
    commandInstance.error(error.message, {
      code: 'ECONNREFUSED',
      suggestions: [
        `Is your service running at ${commandInstance.hostname}?`,
        'You may need to configure the address by setting the ADDRESS environment variable',
        'Example: ADDRESS=localhost:8080 lai status',
        'You can also set the address by passing the --address flag to the command',
        'Example: lai --address=localhost:8080 status',
      ],
    })
  } else {
    commandInstance.error(error)
  }
}
