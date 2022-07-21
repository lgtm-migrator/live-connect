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
    console.log('events.bus.registerBus')
    if (!window) {
      privateBus.error(new Error('Bus can only be attached to the window, which is not present'))
    } else {
      window[C.EVENT_BUS_NAMESPACE] = busWithBestLIConfiguration(privateBus)
    }
    return window[C.EVENT_BUS_NAMESPACE]
  } catch (e) {
    console.error('events.bus.init', e)
    privateBus.error(new Error('Failed to attach message bus to window'))
  }
}

export function busWithBestLIConfiguration (privateBus) {
  const liConfigs = []
  if (privateBus && privateBus.q && privateBus.q.li_config) {
    liConfigs.push(privateBus.q.li_config)
  }

  if (window && window[C.EVENT_BUS_NAMESPACE] && window[C.EVENT_BUS_NAMESPACE].q && window[C.EVENT_BUS_NAMESPACE].q.li_config) {
    liConfigs.push(window[C.EVENT_BUS_NAMESPACE].q.li_config.flat())
  }

  const flattenLiConfigs = liConfigs.flat(Infinity)

  if (flattenLiConfigs && flattenLiConfigs.length > 0) {
    for (var i = 0; i < flattenLiConfigs.length; i++) {
      if (flattenLiConfigs[i] && flattenLiConfigs[i].appId) {
        privateBus.q.li_config = [flattenLiConfigs[i]]
        return privateBus
      }
    }
    privateBus.q.li_config = [flattenLiConfigs[0]]
    return privateBus
  } else return privateBus
}
