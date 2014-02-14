// Karma configuration
// Generated on Tue Feb 11 2014 08:51:19 GMT+0100 (Mitteleuropäische Zeit)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['mocha', 'requirejs', 'chai', 'benchmark'],

//      plugins : [
//          'karma-mocha',
//          'karma-chrome-launcher',
//          'karma-firefox-launcher',
//          'karma-spec-reporter'
//      ],

      preprocessors: {},

    // list of files / patterns to load in the browser
    files: [
      'test/test-main.js',
      {pattern: 'bower_components/**/*.js', included: false},
      {pattern: 'base/**/*.js', included: false},
      {pattern: 'ui/**/*.js', included: false},
      {pattern: 'test/**/*', included: false}
    ],


    // list of files to exclude
    exclude: [
      
    ],

//    client: {
//      mocha: {
//        ui: 'tdd'
//      }
//    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['spec'],


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
    browsers: ['Chrome', 'ChromeCanary', 'Firefox', 'IE'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
