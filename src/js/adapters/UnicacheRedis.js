!function( root, name, factory ){
"use strict";
if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if ( ('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/ ) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          this,
    /* module name */           "UNICACHE_REDIS",
    /* module factory */        function ModuleFactory__UNICACHE_REDIS( undef ){
"use strict";

return function( UNICACHE ) {
    var PROTO = 'prototype', _ = UNICACHE._, Redis = null;

    try{
        Redis = require('redis');
    } catch(e) {
        Redis = null;
    }

    var RedisCache = UNICACHE.RedisCache = function( ) { };

    // extend UNICACHE.Cache class
    RedisCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

    RedisCache.isSupported = function( ) {
        return !!RedisCache;
    };


    return RedisCache;
};

});