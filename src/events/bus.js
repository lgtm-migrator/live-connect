import E from './replayemitter'
import * as C from '../utils/consts'

/**
 * @param {number} size
 * @param {function} errorCallback
 * @return {ReplayEmitter}
 */
export function init (size, errorCallback) {
  if (!size) {
    size = 5
  }
  try {
    console.log('events.bus.init')
    if (!window) {
      errorCallback(new Error('Bus can only be attached to the window, which is not present'))
    }
    if (window && !window[C.EVENT_BUS_NAMESPACE]) {
      window[C.EVENT_BUS_NAMESPACE] = new E(size)
    }
    return window[C.EVENT_BUS_NAMESPACE]
  } catch (e) {
    console.error('events.bus.init', e)
    errorCallback(e)
  }
}

export function registerBus (privateBus) {
  try {
    console.log('events.bus.init')
    if (!window) {
      privateBus.error(new Error('Bus can only be attached to the window, which is not present'))
    } else {
      window[C.EVENT_BUS_NAMESPACE] = privateBus
    }
    return window[C.EVENT_BUS_NAMESPACE]
  } catch (e) {
    console.error('events.bus.init', e)
    privateBus.error(new Error('Failied to attach message bus to window'))
  }
}
