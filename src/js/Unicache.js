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
    
    dispose: function( ) {
        return this;
    },
    
    supportsSync: function( ) {
        // whether this cache type supports sync operations
        // else a callback needs to be provided (as last argument in standard manner)
        return false;
    },
    
    prefix: '',
    setPrefix: function( prefix ) {
        this.prefix = !!prefix ? (''+prefix) : '';
        return this;
    },

    // NOTE: All following cache manipulation methods can be "promisified" if wanted
    // since they use callbacks in standard manner i.e as last arguments with signature: function(err, result)
    // abstract methods, need implementation
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
    
    // promisified methods
    getPromise: function( key ){
        var self = this;
        if ( 'function' === typeof Promise )
        {
            return new Promise(function(resolve,reject){
                self.get(key, function(err,res){
                    if ( err ) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    putPromise: function( key, data, ttl ){
        var self = this;
        if ( 'function' === typeof Promise )
        {
            return new Promise(function(resolve,reject){
                self.put(key, data, ttl, function(err,res){
                    if ( err ) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    removePromise: function( key ){
        var self = this;
        if ( 'function' === typeof Promise )
        {
            return new Promise(function(resolve,reject){
                self.remove(key, function(err,res){
                    if ( err ) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    clearPromise: function( ){
        var self = this;
        if ( 'function' === typeof Promise )
        {
            return new Promise(function(resolve,reject){
                self.clear(function(err,res){
                    if ( err ) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    gcPromise: function( maxlifetime ){
        var self = this;
        if ( 'function' === typeof Promise )
        {
            return new Promise(function(resolve,reject){
                self.gc(maxlifetime, function(err,res){
                    if ( err ) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    }
};

var _ = UNICACHE._ = {
    ESC_RE: /([[\]().?/*{}+$^:\\])/g,
    TRIM_RE: null,
    LTRIM_RE: null,
    RTRIM_RE: null,
    
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
        var exists = !!(o && Object.prototype.hasOwnProperty.call(o, k));
        return true===strict ? exists && (null != o[k]) : exists;
    },
    md5: function( data ) {
        return require('crypto').createHash('md5').update(''+data).digest('hex');
    },
    trim: function(str, charlist) {
      var re;
      if ( 2>arguments.length )
      {
          if ( !this.TRIM_RE )
              this.TRIM_RE = new RegExp('^[' + ' \\s\u00A0' + ']+|[' + ' \\s\u00A0' + ']+$', 'g');
          re = this.TRIM_RE;
      }
      else
      {
          charlist = (''+charlist).replace(this.ESC_RE, '\\$1');
          re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
      }
      return ('' + str).replace(re, '')
    },
    ltrim: function(str, charlist) {
      var re;
      if ( 2>arguments.length )
      {
          if ( !this.LTRIM_RE )
              this.LTRIM_RE = new RegExp('^[' + ' \\s\u00A0' + ']+', 'g');
          re = this.LTRIM_RE;
      }
      else
      {
          charlist = (''+charlist).replace(this.ESC_RE, '\\$1');
          re = new RegExp('^[' + charlist + ']+', 'g');
      }
      return ('' + str).replace(re, '')
    },
    rtrim: function(str, charlist) {
      var re;
      if ( 2>arguments.length )
      {
          if ( !this.RTRIM_RE )
              this.RTRIM_RE = new RegExp('[' + ' \\s\u00A0' + ']+$', 'g');
          re = this.RTRIM_RE;
      }
      else
      {
          charlist = (''+charlist).replace(this.ESC_RE, '\\$1');
          re = new RegExp('[' + charlist + ']+$', 'g');
      }
      return ('' + str).replace(re, '')
    }
};

UNICACHE.Factory = function(){};
UNICACHE.Factory.VERSION = VERSION;
UNICACHE.Factory.getCache = function( config ) {
    var backend = _.isset(config, 'cacheType', true) ? (''+config['cacheType']).toUpperCase() : 'MEMORY';
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
                cache.setEncoding( config['FILE']['encoding'] ).setCacheDir( config['FILE']['cacheDir'] );
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
                cache.setOptions( config['MEMCACHED']['options'] ).setServers( config['MEMCACHED']['servers'] );
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
                cache.options( config['REDIS']['options'] );
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
    cache.setPrefix( _.isset(config, 'prefix', true) ? config['prefix'] : '' );
    return cache;
};

// export it
return UNICACHE;
});
