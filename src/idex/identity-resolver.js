import { toParams } from '../utils/url'
import { error } from '../utils/emitter'
import { expiresInDays, isNonEmpty, isObject } from '../utils/types'

const IDEX_STORAGE_KEY = '__li_idex_cache'
const DEFAULT_IDEX_URL = 'https://idx.liadm.com/idex'
const DEFAULT_EXPIRATION_DAYS = 1
const DEFAULT_AJAX_TIMEOUT = 1000

function _responseReceived (storageHandler, domain, expirationDays, successCallback) {
  return response => {
    let responseObj = {}
    if (response) {
      try {
        responseObj = JSON.parse(response)
      } catch (ex) {
        console.error('Error parsing response', ex)
        error('IdentityResolverParser', `Error parsing Idex response: ${response}`, ex)
      }
    }
    try {
      storageHandler.setCookie(
        IDEX_STORAGE_KEY,
        JSON.stringify(responseObj),
        expiresInDays(expirationDays),
        'Lax',
        domain)
    } catch (ex) {
      console.error('Error storing response to cookies', ex)
      error('IdentityResolverStorage', 'Error putting the Idex response in a cookie jar', ex)
    }
    successCallback(responseObj)
  }
}

const _additionalParams = (params) => {
  if (params && isObject(params)) {
    const array = []
    Object.keys(params).forEach((key) => {
      const value = params[key]
      if (value && !isObject(value) && value.length) {
        array.push([encodeURIComponent(key), encodeURIComponent(value)])
      }
    })
    return array
  } else {
    return []
  }
}

function _asParamOrEmpty (param, value, transform) {
  if (isNonEmpty(value)) {
    return [param, transform(value)]
  } else {
    return []
  }
}

/**
 * @param {State} config
 * @param {StorageHandler} storageHandler
 * @param {CallHandler} calls
 * @return {{resolve: function(successCallback: function, errorCallback: function, additionalParams: Object), getUrl: function(additionalParams: Object)}}
 * @constructor
 */
export function IdentityResolver (config, storageHandler, calls) {
  try {
    const nonNullConfig = config || {}
    const idexConfig = nonNullConfig.identityResolutionConfig || {}
    const externalIds = nonNullConfig.retrievedIdentifiers || []
    const expirationDays = idexConfig.expirationDays || DEFAULT_EXPIRATION_DAYS
    const source = idexConfig.source || 'unknown'
    const publisherId = idexConfig.publisherId || 'any'
    const url = idexConfig.url || DEFAULT_IDEX_URL
    const timeout = idexConfig.ajaxTimeout || DEFAULT_AJAX_TIMEOUT
    const tuples = []
    tuples.push(_asParamOrEmpty('duid', nonNullConfig.peopleVerifiedId, encodeURIComponent))
    tuples.push(_asParamOrEmpty('us_privacy', nonNullConfig.usPrivacyString, encodeURIComponent))
    tuples.push(_asParamOrEmpty('gdpr', nonNullConfig.gdprApplies, v => encodeURIComponent(v ? 1 : 0)))
    tuples.push(_asParamOrEmpty('gdpr_consent', nonNullConfig.gdprConsent, encodeURIComponent))
    externalIds.forEach(retrievedIdentifier => {
      tuples.push(_asParamOrEmpty(retrievedIdentifier.name, retrievedIdentifier.value, encodeURIComponent))
    })

    const composeUrl = (additionalParams) => {
      const originalParams = tuples.slice().concat(_additionalParams(additionalParams))
      const params = toParams(originalParams)
      return `${url}/${source}/${publisherId}${params}`
    }
    const unsafeResolve = (successCallback, errorCallback, additionalParams) => {
      const finalUrl = composeUrl(additionalParams)
      const storedCookie = storageHandler.getCookie(IDEX_STORAGE_KEY)
      if (storedCookie) {
        successCallback(JSON.parse(storedCookie))
      } else {
        calls.ajaxGet(finalUrl, _responseReceived(storageHandler, nonNullConfig.domain, expirationDays, successCallback), errorCallback, timeout)
      }
    }
    return {
      resolve: (successCallback, errorCallback, additionalParams) => {
        try {
          unsafeResolve(successCallback, errorCallback, additionalParams)
        } catch (e) {
          console.error('IdentityResolve', e)
          errorCallback()
          error('IdentityResolve', 'Resolve threw an unhandled exception', e)
        }
      },
      getUrl: (additionalParams) => composeUrl(additionalParams)
    }
  } catch (e) {
    console.error('IdentityResolver', e)
    error('IdentityResolver', 'IdentityResolver not created', e)
    return {
      resolve: (successCallback, errorCallback) => {
        errorCallback()
        error('IdentityResolver.resolve', 'Resolve called on an uninitialised IdentityResolver', e)
      },
      getUrl: () => {
        error('IdentityResolver.getUrl', 'getUrl called on an uninitialised IdentityResolver', e)
      }
    }
  }
}
