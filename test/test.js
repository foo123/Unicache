"use strict";

const UNICACHE = require(__dirname + '/../src/js/node/Unicache.js');

console.log('UNICACHE.VERSION = ' + UNICACHE.Factory.VERSION);

const config = {
    'cacheType' : 'FILE',
    'prefix' : 'foo_',

    'FILE' : {
        'cacheDir' : __dirname + '/cache2' // will be created if it does not exist
    }
};


const cache = UNICACHE.Factory.getCache(config);

cache.putPromise('key', 'val', 10)
.then(function(result) {
    setTimeout(function() {
        cache.getPromise('key')
        .then(function(val) {
            console.log(['val', val]);
        })
        .catch(function(err) {
            throw err;
        });
    }, 2000);
    setTimeout(function() {
        cache.getPromise('key')
        .then(function(val) {
            console.log(['val', val]);
        })
        .catch(function(err) {
            throw err;
        });
    }, 12000);
})
.catch(function(err) {
    throw err;
});
