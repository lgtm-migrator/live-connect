/**
 * @typedef {Object} StorageOptions
 * @property {(number| Date |undefined)} [expires]
 * @property {(string|undefined)} [domain]
 * @property {(string|undefined)} [path]
 * @property {(boolean|undefined)} [secure]
 * @property {(boolean|undefined)} [httponly]
 * @property {((''|'Strict'|'Lax')|undefined)} [samesite]
 */
import Cookies from 'js-cookie'

export function Storage (eventBus) {
  let _localStorageIsEnabled = null

  const cookies = Cookies.withConverter({
    read: function (value, name) {
      try {
        const result = Cookies.converter.read(value, name)
        if (result === undefined) {
          return null
        } else {
          return result
        }
      } catch (e) {
        eventBus.emitErrorWithMessage('CookieReadError', `Failed reading cookie ${name}`, e)
        return null
      }
    }
  })

  /**
 * @returns {boolean}
 */
  function localStorageIsEnabled () {
    if (_localStorageIsEnabled == null) {
      _localStorageIsEnabled = _checkLocalStorage()
    }
    return _localStorageIsEnabled
  }

  /**
 * @returns {boolean}
 * @private
 */
  function _checkLocalStorage () {
    let enabled = false
    try {
      if (window && window.localStorage) {
        const key = Math.random().toString()
        window.localStorage.setItem(key, key)
        enabled = window.localStorage.getItem(key) === key
        window.localStorage.removeItem(key)
      }
    } catch (e) {
      eventBus.emitError('LSCheckError', e)
    }
    return enabled
  }

  /**
 * @param {string} key
 * @returns {string|null}
 */
  function getCookie (key) {
    const result = cookies.get(key)
    if (result === undefined) {
      return null
    }
    return result
  }

  /**
 * @param key
 * @return {string|null}
 * @private
 */
  function _unsafeGetFromLs (key) {
    return window.localStorage.getItem(key)
  }

  /**
 * @param {string} key
 * @returns {string|null}
 */
  function getDataFromLocalStorage (key) {
    let ret = null
    if (localStorageIsEnabled()) {
      ret = _unsafeGetFromLs(key)
    }
    return ret
  }

  /**
 * @param keyLike
 * @return {[String]}
 */
  function findSimilarCookies (keyLike) {
    try {
      const allCookies = cookies.get()
      return Object.keys(allCookies).filter(key => key.indexOf(keyLike) >= 0 && allCookies[key] !== null).map(key => allCookies[key])
    } catch (e) {
      eventBus.emitErrorWithMessage('CookieFindSimilarInJar', 'Failed fetching from a cookie jar', e)
      return []
    }
  }

  /**
 * @param {string} key
 * @param {string} value
 * @param {string|number|date} expires
 * @param {string} sameSite
 * @param {string} domain
 * @returns void
 */
  function setCookie (key, value, expires, sameSite, domain) {
    if (expires) {
      let expiresDate
      if (typeof expires === 'string') {
        expiresDate = new Date(expires)
      } else if (typeof expires === 'number') {
        expiresDate = new Date(Date.now() + expires * 864e5)
      } else {
        expiresDate = expires
      }
      cookies.set(key, value, { domain: domain, expires: expiresDate, samesite: sameSite })
    } else {
      cookies.set(key, value, { domain: domain, samesite: sameSite })
    }
  }

  /**
 * @param {string} key
 * @returns {string|null}
 */
  function removeDataFromLocalStorage (key) {
    if (localStorageIsEnabled()) {
      window.localStorage.removeItem(key)
    }
  }

  /**
 * @param {string} key
 * @param {string} value
 * @returns {string|null}
 */
  function setDataInLocalStorage (key, value) {
    if (localStorageIsEnabled()) {
      window.localStorage.setItem(key, value)
    }
  }

  return {
    localStorageIsEnabled: localStorageIsEnabled,
    getCookie: getCookie,
    getDataFromLocalStorage: getDataFromLocalStorage,
    findSimilarCookies: findSimilarCookies,
    setCookie: setCookie,
    removeDataFromLocalStorage: removeDataFromLocalStorage,
    setDataInLocalStorage: setDataInLocalStorage
  }
}
