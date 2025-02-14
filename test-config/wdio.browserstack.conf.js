const currentTime = Date.now()
const commonBStackCapabilities = {
  projectName: 'LiveConnect',
  buildName: `${process.env.CIRCLE_BRANCH || process.env.DEV_BRANCH || 'X'}-${process.env.CIRCLE_BUILD_NUM || currentTime}`,
  video: true,
  debug: true,
  networkLogs: true
}

// https://www.browserstack.com/automate/capabilities
const allCapabilities = [
  { browserName: 'Chrome', browserVersion: 'latest', 'bstack:options': { ...commonBStackCapabilities, os: 'Windows', osVersion: '10'}},
  { browserName: 'Chrome', browserVersion: '40.0', 'bstack:options': { ...commonBStackCapabilities, os: 'Windows', osVersion: '7' }},
  { browserName: 'firefox', browserVersion: 'latest', 'bstack:options': { ...commonBStackCapabilities, os: 'Windows', osVersion: '10' }},
  { browserName: 'firefox', browserVersion: '52.0', 'bstack:options': { ...commonBStackCapabilities, os: 'Windows', osVersion: '7' }},
  { browserName: 'IE', browserVersion: '11.0', 'bstack:options': { ...commonBStackCapabilities, os: 'Windows', osVersion: '10', seleniumVersion: "3.5.2" }},
  { browserName: 'Edge', browserVersion: 'latest', 'bstack:options': { ...commonBStackCapabilities, os: 'Windows', osVersion: '10' }},

  { browserName: 'Safari', browserVersion: '14.1', 'bstack:options': { ...commonBStackCapabilities, os: 'OS X', osVersion: 'Big Sur' }},
  { browserName: 'Safari', browserVersion: '13.1', 'bstack:options': { ...commonBStackCapabilities, os: 'OS X', osVersion: 'Catalina' }},
  { browserName: 'Safari', browserVersion: '12.1', 'bstack:options': { ...commonBStackCapabilities, os: 'OS X', osVersion: 'Mojave' }},
  { browserName: 'Safari', browserVersion: '11.1', 'bstack:options': { ...commonBStackCapabilities, os: 'OS X', osVersion: 'High Sierra' }},
  { browserName: 'Safari', browserVersion: '10.1', 'bstack:options': { ...commonBStackCapabilities, os: 'OS X', osVersion: 'Sierra' }},

  { browserName: 'Safari', browserVersion: '15.0', 'bstack:options': { ...commonBStackCapabilities, deviceName: 'iPhone 11 Pro', osVersion: '15 Beta', realMobile: true }},
  { browserName: 'Safari', browserVersion: '14.0', 'bstack:options': { ...commonBStackCapabilities, deviceName: 'iPhone 12', osVersion: '14', realMobile: true }},
  { browserName: 'Safari', browserVersion: '13.0', 'bstack:options': { ...commonBStackCapabilities, deviceName: 'iPhone 11', osVersion: '13', realMobile: true }},
  { browserName: 'Safari', browserVersion: '12.0', 'bstack:options': { ...commonBStackCapabilities, deviceName: 'iPhone 8', osVersion: '12', realMobile: true }},
  { browserName: 'Safari', browserVersion: '11.0', 'bstack:options': { ...commonBStackCapabilities, deviceName: 'iPad Pro 9.7 2016', osVersion: '11', realMobile: true }},

  { browserName: 'Chrome', browserVersion: 'latest', 'bstack:options': { ...commonBStackCapabilities, deviceName: 'Samsung Galaxy S21', osVersion: '11.0', realMobile: true }},
  { browserName: 'Chrome', browserVersion: '67', 'bstack:options': { ...commonBStackCapabilities, deviceName: 'Google Nexus 6', osVersion: '6.0', realMobile: true }}
]

exports.config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  //
  // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
  // on a remote machine).
  runner: 'local',

  //
  // Override default path ('/wd/hub') for chromedriver service.
  // path: '/',
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  specs: [
    './test/it/**/*.spec.js'
  ],

  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],

  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 1,

  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: allCapabilities,

  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'warn',

  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/applitools-service, @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner, @wdio/lambda-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevels: {
    webdriver: 'warn',
    '@wdio/browserstack-service': 'info'
  },

  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,

  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  baseUrl: 'http://localhost',

  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 30000,

  //
  // Default timeout in milliseconds for request
  // if Selenium Grid doesn't send response
  connectionRetryTimeout: 300000,

  //
  // Default request retries count
  connectionRetryCount: 3,

  services: [["browserstack", {
    browserstackLocal: true,

    opts: {
      verbose: true
    }
  }]],

  user: process.env.BS_USER,
  key: process.env.BS_KEY,
  hostname: 'hub.browserstack.com',

  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: https://webdriver.io/docs/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  framework: 'mocha',

  //
  // The number of times to retry the entire specfile when it fails as a whole
  specFileRetries: 2,

  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter.html
  reporters: [
    'spec',
    ['junit', {
      outputDir: './test-results/browserstack',
      outputFileFormat: function (options) {
        return `${options.capabilities.browserName}_${options.capabilities.version}_${options.capabilities.platform}_${options.cid}.xml`
      }
    }]
  ],

  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    timeout: 600000,
    require: ['@babel/register', '@babel/polyfill']
  }
}
