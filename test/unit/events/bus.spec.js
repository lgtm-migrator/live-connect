import { expect, use } from 'chai'
import * as bus from '../../../src/events/bus'
import E from '../../../src/events/replayemitter'
import * as C from '../../../src/utils/consts'
import jsdom from 'mocha-jsdom'
import dirtyChai from 'dirty-chai'

use(dirtyChai)

describe('EventsBus in a window', () => {
  jsdom({
    url: 'http://www.example.com',
    useEach: true
  })

  it('should set up a bus on a global namespace according to constants', function () {
    const eventBus = bus.init()
    expect(eventBus.size).to.eql(5)
    expect(window[C.EVENT_BUS_NAMESPACE]).to.not.eql(null)
    expect(window[C.EVENT_BUS_NAMESPACE].on).to.not.eql(null)
    expect(typeof window[C.EVENT_BUS_NAMESPACE].on).to.eql('function')
    expect(window[C.EVENT_BUS_NAMESPACE].emit).to.not.eql(null)
    expect(typeof window[C.EVENT_BUS_NAMESPACE].emit).to.eql('function')
  })

  it('should reuse the bus on a global namespace according to constants', function () {
    bus.init()
    const firstBus = window[C.EVENT_BUS_NAMESPACE]
    firstBus.on('a-dell', () => console.log('Hello, its me'))
    bus.init()
    const secondBus = window[C.EVENT_BUS_NAMESPACE]
    expect(firstBus).to.eql(secondBus)
  })

  it('should set the size correctly', function () {
    const eventBus = bus.init(3)
    expect(eventBus.size).to.eq(3)
  })
})

describe('registerBus', () => {
  jsdom({
    url: 'http://www.example.com',
    useEach: true
  })

  it('should register the private bus with the defined single configuration', function () {
    const privateBus = new E(5)
    const config = { trackerName: 'v1.0.1' }
    const firstBus = window[C.EVENT_BUS_NAMESPACE]
    privateBus.emit('li_config', config)
    bus.registerBus(privateBus)
    const secondBus = window[C.EVENT_BUS_NAMESPACE]
    expect(firstBus).to.not.eql(secondBus)
    expect(secondBus.q.li_config).to.eql([[config]])
  })

  it('should register the private bus with the first configuration that has a defined appId', function () {
    const privateBus = new E(5)
    bus.init()
    const config1 = { trackerName: 'v1.0.1' }
    const config2 = { trackerName: 'v1.0.2' }
    const config3 = { trackerName: 'v1.0.3', appId: 'app-0147' }
    const config4 = { trackerName: 'v1.0.4', appId: 'app-0148' }
    const config5 = { trackerName: 'v1.0.5' }
    const firstBus = window[C.EVENT_BUS_NAMESPACE]
    firstBus.emit('li_config', config1)
    privateBus.emit('li_config', [config2, config3, config4, config5])
    bus.registerBus(privateBus)
    const secondBus = window[C.EVENT_BUS_NAMESPACE]
    expect(firstBus).to.not.eql(secondBus)
    expect(secondBus.q.li_config).to.eql([[config3]])
  })
})

describe('EventsBus with no window', () => {
  it('call the callback with an error', function () {
    let error = null
    const callback = (e) => {
      error = e
    }
    const eventBus = bus.init(1, callback)
    expect(eventBus).to.eql(undefined)
    expect(error).to.not.eql(null)
  })
})
