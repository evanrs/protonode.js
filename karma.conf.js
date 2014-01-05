// Karma configuration
// Generated on Fri Jan 03 2014 23:46:32 GMT-0500 (EST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['mocha', 'chai'],

    // options to pass 
    client: {
      mocha: {
        ui: 'bdd',
      }
    },


    // list of files / patterns to load in the browser
    files: [
        './node_modules/lodash/lodash.js'
    ,   'protonode.js'
    ,   'spec/fixtures.js'
    ,   'spec/support/console.js'
    ,   'spec/nodeSpec.js'
      // {pattern: 'protonode.js', included: false},
      // {pattern: 'spec/*.js', included: false}
    ],


    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['mocha'],

    // plugins: [
    //     'karma-jasmine',
    //     'karma-coverage',
    //     'karma-mocha',
    //     'karma-mocha-reporter'
    // ],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
