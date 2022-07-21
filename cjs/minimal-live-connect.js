'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function safeToString(value) {
  return _typeof(value) === 'object' ? JSON.stringify(value) : '' + value;
}
function isNonEmpty(value) {
  return typeof value !== 'undefined' && value !== null && trim(value).length > 0;
}
function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
}
var hasTrim = !!String.prototype.trim;
function trim(value) {
  return hasTrim ? ('' + value).trim() : ('' + value).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
function isString(str) {
  return typeof str === 'string';
}
function strEqualsIgnoreCase(fistStr, secondStr) {
  return isString(fistStr) && isString(secondStr) && trim(fistStr.toLowerCase()) === trim(secondStr.toLowerCase());
}
function isObject(obj) {
  return !!obj && _typeof(obj) === 'object' && !isArray(obj);
}
function isFunction(fun) {
  return fun && typeof fun === 'function';
}
function asParamOrEmpty(param, value, transform) {
  return isNonEmpty(value) ? [param, isFunction(transform) ? transform(value) : value] : [];
}
function asStringParam(param, value) {
  return asParamOrEmpty(param, value, function (s) {
    return encodeURIComponent(s);
  });
}
function asStringParamWhen(param, value, predicate) {
  return isNonEmpty(value) && isFunction(predicate) && predicate(value) ? [param, encodeURIComponent(value)] : [];
}
function mapAsParams(paramsMap) {
  if (paramsMap && isObject(paramsMap)) {
    var array = [];
    Object.keys(paramsMap).forEach(function (key) {
      var value = paramsMap[key];
      if (value && !isObject(value) && value.length) {
        if (isArray(value)) {
          value.forEach(function (entry) {
            return array.push([encodeURIComponent(key), encodeURIComponent(entry)]);
          });
        } else {
          array.push([encodeURIComponent(key), encodeURIComponent(value)]);
        }
      }
    });
    return array;
  } else {
    return [];
  }
}
function merge(obj1, obj2) {
  var res = {};
  var clean = function clean(obj) {
    return isObject(obj) ? obj : {};
  };
  var first = clean(obj1);
  var second = clean(obj2);
  Object.keys(first).forEach(function (key) {
    res[key] = first[key];
  });
  Object.keys(second).forEach(function (key) {
    res[key] = second[key];
  });
  return res;
}

var toParams = function toParams(tuples) {
  var acc = '';
  tuples.forEach(function (tuple) {
    var operator = acc.length === 0 ? '?' : '&';
    if (tuple && tuple.length && tuple.length === 2 && tuple[0] && tuple[1]) {
      acc = "".concat(acc).concat(operator).concat(tuple[0], "=").concat(tuple[1]);
    }
  });
  return acc;
};

var EVENT_BUS_NAMESPACE = '__li__evt_bus';
var ERRORS_PREFIX = 'li_errors';
var PEOPLE_VERIFIED_LS_ENTRY = '_li_duid';
var DEFAULT_IDEX_AJAX_TIMEOUT = 5000;
var DEFAULT_IDEX_URL = 'https://idx.liadm.com/idex';

function _emit(prefix, message) {
  window && window[EVENT_BUS_NAMESPACE] && window[EVENT_BUS_NAMESPACE].emit(prefix, message);
}
function fromError(name, exception) {
  error(name, exception.message, exception);
}
function error(name, message) {
  var e = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var wrapped = new Error(message || e.message);
  wrapped.stack = e.stack;
  wrapped.name = name || 'unknown error';
  wrapped.lineNumber = e.lineNumber;
  wrapped.columnNumber = e.columnNumber;
  _emit(ERRORS_PREFIX, wrapped);
}

function _responseReceived(successCallback) {
  return function (response) {
    var responseObj = {};
    if (response) {
      try {
        responseObj = JSON.parse(response);
      } catch (ex) {
        fromError('IdentityResolverParser', ex);
      }
    }
    successCallback(responseObj);
  };
}
function IdentityResolver(config, calls) {
  try {
    var nonNullConfig = config || {};
    var idexConfig = nonNullConfig.identityResolutionConfig || {};
    var externalIds = nonNullConfig.retrievedIdentifiers || [];
    var source = idexConfig.source || 'unknown';
    var publisherId = idexConfig.publisherId || 'any';
    var url = idexConfig.url || DEFAULT_IDEX_URL;
    var timeout = idexConfig.ajaxTimeout || DEFAULT_IDEX_AJAX_TIMEOUT;
    var tuples = [];
    tuples.push(asStringParam('duid', nonNullConfig.peopleVerifiedId));
    tuples.push(asStringParam('us_privacy', nonNullConfig.usPrivacyString));
    tuples.push(asParamOrEmpty('gdpr', nonNullConfig.gdprApplies, function (v) {
      return encodeURIComponent(v ? 1 : 0);
    }));
    tuples.push(asStringParamWhen('n3pc', nonNullConfig.privacyMode ? 1 : 0, function (v) {
      return v === 1;
    }));
    tuples.push(asStringParam('gdpr_consent', nonNullConfig.gdprConsent));
    externalIds.forEach(function (retrievedIdentifier) {
      tuples.push(asStringParam(retrievedIdentifier.name, retrievedIdentifier.value));
    });
    var composeUrl = function composeUrl(additionalParams) {
      var originalParams = tuples.slice().concat(mapAsParams(additionalParams));
      var params = toParams(originalParams);
      return "".concat(url, "/").concat(source, "/").concat(publisherId).concat(params);
    };
    var unsafeResolve = function unsafeResolve(successCallback, errorCallback, additionalParams) {
      calls.ajaxGet(composeUrl(additionalParams), _responseReceived(successCallback), errorCallback, timeout);
    };
    return {
      resolve: function resolve(successCallback, errorCallback, additionalParams) {
        try {
          unsafeResolve(successCallback, errorCallback, additionalParams);
        } catch (e) {
          errorCallback();
          fromError('IdentityResolve', e);
        }
      },
      getUrl: function getUrl(additionalParams) {
        return composeUrl(additionalParams);
      }
    };
  } catch (e) {
    fromError('IdentityResolver', e);
    return {
      resolve: function resolve(successCallback, errorCallback) {
        errorCallback();
        fromError('IdentityResolver.resolve', e);
      },
      getUrl: function getUrl() {
        fromError('IdentityResolver.getUrl', e);
      }
    };
  }
}

function enrich(state, storageHandler) {
  try {
    return {
      peopleVerifiedId: state.peopleVerifiedId || storageHandler.getDataFromLocalStorage(PEOPLE_VERIFIED_LS_ENTRY)
    };
  } catch (e) {
    error('PeopleVerifiedEnrich', e.message, e);
    return {};
  }
}

for (var r = [], o = 0; o < 64;) {
  r[o] = 0 | 4294967296 * Math.sin(++o % Math.PI);
}

for (var r$1, o$1 = 18, n = [], t = []; o$1 > 1; o$1--) {
  for (r$1 = o$1; r$1 < 320;) {
    n[r$1 += o$1] = 1;
  }
}
function e(r, o) {
  return 4294967296 * Math.pow(r, 1 / o) | 0;
}
for (r$1 = 0; r$1 < 64;) {
  n[++o$1] || (t[r$1] = e(o$1, 2), n[r$1++] = e(o$1, 3));
}

var emailRegex = function emailRegex() {
  return /\S+(@|%40)\S+\.\S+/;
};
function isEmail(s) {
  return emailRegex().test(s);
}
function containsEmailField(s) {
  return emailRegex().test(s);
}

function enrich$1(state, storageHandler) {
  try {
    return _parseIdentifiersToResolve(state, storageHandler);
  } catch (e) {
    fromError('IdentifiersEnrich', e);
    return {};
  }
}
function _parseIdentifiersToResolve(state, storageHandler) {
  state.identifiersToResolve = state.identifiersToResolve || [];
  var cookieNames = isArray(state.identifiersToResolve) ? state.identifiersToResolve : safeToString(state.identifiersToResolve).split(',');
  var identifiers = [];
  for (var i = 0; i < cookieNames.length; i++) {
    var identifierName = trim(cookieNames[i]);
    var identifierValue = storageHandler.getCookie(identifierName) || storageHandler.getDataFromLocalStorage(identifierName);
    if (identifierValue && !containsEmailField(safeToString(identifierValue)) && !isEmail(safeToString(identifierValue))) {
      identifiers.push({
        name: identifierName,
        value: safeToString(identifierValue)
      });
    }
  }
  return {
    retrievedIdentifiers: identifiers
  };
}

function enrich$2(state) {
  if (isNonEmpty(state) && isNonEmpty(state.gdprApplies)) {
    var privacyMode = !!state.gdprApplies;
    return {
      privacyMode: privacyMode
    };
  } else return {};
}

function E(replaySize) {
  this.size = parseInt(replaySize) || 5;
  this.h = {};
  this.q = {};
}
E.prototype = {
  on: function on(name, callback, ctx) {
    (this.h[name] || (this.h[name] = [])).push({
      fn: callback,
      ctx: ctx
    });
    var eventQueueLen = (this.q[name] || []).length;
    for (var i = 0; i < eventQueueLen; i++) {
      callback.apply(ctx, this.q[name][i]);
    }
    return this;
  },
  once: function once(name, callback, ctx) {
    var self = this;
    var eventQueue = this.q[name] || [];
    if (eventQueue.length > 0) {
      callback.apply(ctx, eventQueue[0]);
      return this;
    } else {
      var listener = function listener() {
        self.off(name, listener);
        callback.apply(ctx, arguments);
      };
      listener._ = callback;
      return this.on(name, listener, ctx);
    }
  },
  emit: function emit(name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = (this.h[name] || []).slice();
    var i = 0;
    var len = evtArr.length;
    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }
    var eventQueue = this.q[name] || (this.q[name] = []);
    if (eventQueue.length >= this.size) {
      eventQueue.shift();
    }
    eventQueue.push(data);
    return this;
  },
  off: function off(name, callback) {
    var handlers = this.h[name];
    var liveEvents = [];
    if (handlers && callback) {
      for (var i = 0, len = handlers.length; i < len; i++) {
        if (handlers[i].fn !== callback && handlers[i].fn._ !== callback) {
          liveEvents.push(handlers[i]);
        }
      }
    }
    liveEvents.length ? this.h[name] = liveEvents : delete this.h[name];
    return this;
  }
};

function init(size, errorCallback) {
  if (!size) {
    size = 5;
  }
  try {
    if (!window) {
      errorCallback(new Error('Bus can only be attached to the window, which is not present'));
    }
    if (window && !window[EVENT_BUS_NAMESPACE]) {
      window[EVENT_BUS_NAMESPACE] = new E(size);
    }
    return window[EVENT_BUS_NAMESPACE];
  } catch (e) {
    errorCallback(e);
  }
}
function registerBus(privateBus) {
  try {
    if (!window) {
      privateBus.error(new Error('Bus can only be attached to the window, which is not present'));
    } else {
      window[EVENT_BUS_NAMESPACE] = busWithBestLIConfiguration(privateBus);
    }
    return window[EVENT_BUS_NAMESPACE];
  } catch (e) {
    privateBus.error(new Error('Failed to attach message bus to window'));
  }
}
function busWithBestLIConfiguration(privateBus) {
  var liConfigs = [];
  if (window && window[EVENT_BUS_NAMESPACE] && window[EVENT_BUS_NAMESPACE].q && window[EVENT_BUS_NAMESPACE].q.li_config) {
    liConfigs.push(window[EVENT_BUS_NAMESPACE].q.li_config);
  }
  if (privateBus && privateBus.q && privateBus.q.li_config) {
    liConfigs.push(privateBus.q.li_config);
  }
  var flattenLiConfigs = liConfigs.flat(Infinity);
  if (flattenLiConfigs && flattenLiConfigs.length > 0) {
    for (var i = 0; i < flattenLiConfigs.length; i++) {
      if (flattenLiConfigs[i] && flattenLiConfigs[i].appId) {
        privateBus.q.li_config = [[flattenLiConfigs[i]]];
        return privateBus;
      }
    }
    privateBus.q.li_config = [[flattenLiConfigs[0]]];
  }
  return privateBus;
}

var StorageStrategy = {
  cookie: 'cookie',
  localStorage: 'ls',
  none: 'none',
  disabled: 'disabled'
};

var _noOp = function _noOp() {
  return undefined;
};
function StorageHandler(storageStrategy, externalStorageHandler) {
  var errors = [];
  function _externalOrError(functionName) {
    var hasExternal = externalStorageHandler && externalStorageHandler[functionName] && isFunction(externalStorageHandler[functionName]);
    if (strEqualsIgnoreCase(storageStrategy, StorageStrategy.disabled)) {
      return _noOp;
    } else if (hasExternal) {
      return externalStorageHandler[functionName];
    } else {
      errors.push(functionName);
      return _noOp;
    }
  }
  var _orElseNoOp = function _orElseNoOp(fName) {
    return strEqualsIgnoreCase(storageStrategy, StorageStrategy.none) ? _noOp : _externalOrError(fName);
  };
  var handler = {
    localStorageIsEnabled: _orElseNoOp('localStorageIsEnabled'),
    getCookie: _externalOrError('getCookie'),
    getDataFromLocalStorage: _externalOrError('getDataFromLocalStorage')
  };
  if (errors.length > 0) {
    error('StorageHandler', "The storage functions '".concat(JSON.stringify(errors), "' are not provided"));
  }
  return handler;
}

var _noOp$1 = function _noOp() {
  return undefined;
};
function CallHandler(externalCallHandler) {
  var errors = [];
  function _externalOrError(functionName) {
    var hasExternal = externalCallHandler && externalCallHandler[functionName] && isFunction(externalCallHandler[functionName]);
    if (hasExternal) {
      return externalCallHandler[functionName];
    } else {
      errors.push(functionName);
      return _noOp$1;
    }
  }
  var handler = {
    ajaxGet: _externalOrError('ajaxGet'),
    pixelGet: _externalOrError('pixelGet')
  };
  if (errors.length > 0) {
    error('CallHandler', "The call functions '".concat(JSON.stringify(errors), "' are not provided"));
  }
  return handler;
}

function _minimalInitialization(liveConnectConfig, externalStorageHandler, externalCallHandler, messageBus) {
  try {
    if (messageBus) registerBus(messageBus);else init();
    var callHandler = CallHandler(externalCallHandler);
    var configWithPrivacy = merge(liveConnectConfig, enrich$2(liveConnectConfig));
    var storageStrategy = configWithPrivacy.privacyMode ? StorageStrategy.disabled : configWithPrivacy.storageStrategy;
    var storageHandler = StorageHandler(storageStrategy, externalStorageHandler);
    var peopleVerifiedData = merge(configWithPrivacy, enrich(configWithPrivacy, storageHandler));
    var peopleVerifiedDataWithAdditionalIds = merge(peopleVerifiedData, enrich$1(peopleVerifiedData, storageHandler));
    var resolver = IdentityResolver(peopleVerifiedDataWithAdditionalIds, callHandler);
    return {
      push: function push(arg) {
        return window.liQ.push(arg);
      },
      fire: function fire() {
        return window.liQ.push({});
      },
      peopleVerifiedId: peopleVerifiedDataWithAdditionalIds.peopleVerifiedId,
      ready: true,
      resolve: resolver.resolve,
      resolutionCallUrl: resolver.getUrl,
      config: liveConnectConfig
    };
  } catch (x) {
  }
}
function MinimalLiveConnect(liveConnectConfig, externalStorageHandler, externalCallHandler, messageBus) {
  try {
    window && (window.liQ = window.liQ || []);
    var configuration = isObject(liveConnectConfig) && liveConnectConfig || {};
    return _minimalInitialization(configuration, externalStorageHandler, externalCallHandler, messageBus);
  } catch (x) {
  }
  return {};
}

exports.MinimalLiveConnect = MinimalLiveConnect;
