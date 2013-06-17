var paths = {
    'domReady': '../node_modules/domReady/domReady',
    'src': '../src'
},
    requirejs;

if (!(typeof window !== 'undefined' && window.navigator && window.document)) { // Test if we are at command line
    requirejs = require('requirejs');
    requirejs.config({
        baseUrl: __dirname + '/../',
        paths: paths,
        nodeRequire: require
    });

    global.define = require('requirejs');
    global.browser = false;
    global.expect = require('expect.js');

    // Change working directory due to some issues related with requirejs
    process.chdir(__dirname + '/..');
} else {
    global = window;
    global.expect = expect;
    global.browser = true;

    require({
        baseUrl: './',
        paths: paths,
        waitSeconds: (window.location.protocol === 'file:' || window.location.href.indexOf('://localhost') !== -1) ? 5 : 45, // Fail early locally
        urlArgs: 'bust=' + (+new Date())
    });
}

global.evaluated = true;