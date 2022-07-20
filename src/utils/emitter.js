import * as C from '../utils/consts'

export function Emitter (messageBus) {
  function _emit (prefix, message) {
    messageBus.emit(prefix, message)
  }

  function _send (prefix, message) {
    _emit(prefix, message)
  }

  function _fromError (name, exception) {
    error(name, exception.message, exception)
  }

  function _error (name, message, e = {}) {
    const wrapped = new Error(message || e.message)
    wrapped.stack = e.stack
    wrapped.name = name || 'unknown error'
    wrapped.lineNumber = e.lineNumber
    wrapped.columnNumber = e.columnNumber
    _emit(C.ERRORS_PREFIX, wrapped)
  }

  const emitter = {
    send: _send,
    fromError: _fromError,
    error: _error,
    bus: messageBus
  }

  return emitter
}

function _emit (prefix, message) {
  window && window[C.EVENT_BUS_NAMESPACE] && window[C.EVENT_BUS_NAMESPACE].emit(prefix, message)
}

export function send (prefix, message) {
  _emit(prefix, message)
}

export function fromError (name, exception) {
  error(name, exception.message, exception)
}

export function error (name, message, e = {}) {
  const wrapped = new Error(message || e.message)
  wrapped.stack = e.stack
  wrapped.name = name || 'unknown error'
  wrapped.lineNumber = e.lineNumber
  wrapped.columnNumber = e.columnNumber
  _emit(C.ERRORS_PREFIX, wrapped)
}
