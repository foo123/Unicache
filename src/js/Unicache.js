/**
*   Unicache,
*   an agnostic caching framework for Node, PHP, Python
*
*   @version: 1.2.0
*   https://github.com/foo123/Unicache
**/
!function( root, name, factory ){
"use strict";
if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if ( ('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/ ) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          this,
    /* module name */           "UNICACHE",
    /* module factory */        function ModuleFactory__UNICACHE( undef ){
"use strict";

var VERSION = '1.2.0', PROTO = 'prototype', NotImplemented = new Error("Not Implemented!");

var UNICACHE = {};
UNICACHE.Cache = function(){};
UNICACHE.Cache[PROTO] = {

    constructor: UNICACHE.Cache,
    // abstract methods need implementation
    get: function( key, cb ){
        throw NotImplemented;
    },
    put: function( key, data, ttl, cb ){
        throw NotImplemented;
    },
    remove: function( key, cb ){
        throw NotImplemented;
    },
    clear: function( cb ){
        throw NotImplemented;
    },
    gc: function( maxlifetime, cb ){
        throw NotImplemented;
    },

    prefix: '',
    setPrefix: function( prefix ) {
        this.prefix = !!prefix ? ''+prefix : '';
        return this;
    },

    dispose: function( ) {
        return this;
    }
};

UNICACHE._ = {
    time: function( ){
        return Math.floor(new Date().getTime() / 1000);
    },
    serialize: function( data ) {
        return JSON.stringify(data);
    },
    unserialize: function( data ) {
        return JSON.parse(data);
    },
    isset: function( o, k, strict ) {
        var exists = !!(o && k && Object.prototype.hasOwnProperty.call(o, k));
        return true===strict ? exists && (null != o[k]) : exists;
    },
    md5: function( data ) {
        return require('crypto').createHash('md5').update(''+data).digest('hex');
    },
    trim: function(str, charlist) {
      charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '\\$1');
      var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g')
      return ('' + str).replace(re, '')
    },
    ltrim: function(str, charlist) {
      charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '\\$1');
      var re = new RegExp('^[' + charlist + ']+', 'g')
      return ('' + str).replace(re, '')
    },
    rtrim: function(str, charlist) {
      charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '\\$1');
      var re = new RegExp('[' + charlist + ']+$', 'g')
      return ('' + str).replace(re, '')
    }
};

UNICACHE.Factory = function(){};
UNICACHE.Factory.VERSION = VERSION;
UNICACHE.Factory.getCache = function(config) {
    var backend = !!config['cacheType'] ? config['cacheType'].toUpperCase() : 'MEMORY';
    var cache = null;

    switch( backend )
    {
        case 'FILE':
            if ( !UNICACHE.FileCache )
                UNICACHE.FileCache = require(__dirname+'/adapters/UnicacheFile.js')(UNICACHE);
            if ( !UNICACHE.FileCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.FileCache();
                cache.setCacheDir( config['FILE']['cacheDir'] );
            }
            break;
        case 'MEMCACHED':
            if ( !UNICACHE.MemcachedCache )
                UNICACHE.MemcachedCache = require(__dirname+'/adapters/UnicacheMemcached.js')(UNICACHE);
            if ( !UNICACHE.MemcachedCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.MemcachedCache();
                if ( config['MEMCACHED'] && config['MEMCACHED']['servers'] && config['MEMCACHED']['servers'].length )
                {
                    for(var srv,i=0,l=config['MEMCACHED']['servers'].length; i<l; i++)
                    {
                        srv = config['MEMCACHED']['servers'][i];
                        cache.addServer( srv['host'], srv['port'], srv['weight'] );
                    }
                }
            }
            break;
        case 'REDIS':
            if ( !UNICACHE.RedisCache )
                UNICACHE.RedisCache = require(__dirname+'/adapters/UnicacheRedis.js')(UNICACHE);
            if ( !UNICACHE.RedisCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.RedisCache();
                cache.server( config['REDIS']['server']['host'], config['REDIS']['server']['port'] );
            }
            break;
        default:
            // default in-memory cache
            if ( !UNICACHE.MemoryCache )
                UNICACHE.MemoryCache = require(__dirname+'/adapters/UnicacheMemory.js')(UNICACHE);
            if ( !UNICACHE.MemoryCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "MEMORY" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.MemoryCache();
            }
            break;
    }
    cache.setPrefix( !!config['prefix'] ? config['prefix'] : '' );
    return cache;
};

// export it
return UNICACHE;
});