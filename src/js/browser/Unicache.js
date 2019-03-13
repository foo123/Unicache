/**
*  Unicache
*  An agnostic caching framework for PHP, Node.js, Browser, Python
*
*  @version: 1.2.0
*  https://github.com/foo123/Unicache
*
**/
!function( root, name, factory ){
"use strict";
if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if ( ('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/ ) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          'undefined' !== typeof self ? self : this,
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
        case 'INDEXEDDB':
            if ( !UNICACHE.IndexedDbCache || !UNICACHE.IndexedDbCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.IndexedDbCache();
            }
            break;
        case 'WEBSQL':
            if ( !UNICACHE.WebSqlCache || !UNICACHE.WebSqlCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.WebSqlCache();
            }
            break;
        case 'SESSIONSTORAGE':
            if ( !UNICACHE.SessionStorageCache || !UNICACHE.SessionStorageCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.SessionStorageCache();
            }
            break;
        case 'LOCALSTORAGE':
            if ( !UNICACHE.LocalStorageCache || !UNICACHE.LocalStorageCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.LocalStorageCache();
            }
            break;
        case 'COOKIE':
            if ( !UNICACHE.CookieCache || !UNICACHE.CookieCache.isSupported() )
            {
                throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
            }
            else
            {
                cache = new UNICACHE.CookieCache();
            }
            break;
        default:
            // default in-memory cache
            if ( !UNICACHE.MemoryCache || !UNICACHE.MemoryCache.isSupported() )
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


!function(UNICACHE){
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var MemoryCache = UNICACHE.MemoryCache = function( ) {
    this._cache = {};
};

// extend UNICACHE.Cache class
MemoryCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

MemoryCache.isSupported = function( ) {
    return true;
};

MemoryCache[PROTO]._cache = null;

MemoryCache[PROTO].dispose = function( ) {
    this._cache = null;
};

MemoryCache[PROTO].supportsSync = function( ) {
    // can read/write/etc using sync operations as well
    return true;
};

MemoryCache[PROTO].put = function( key, data, ttl, cb ) {
    this._cache[this.prefix+key] = [_.time()+ttl,data];
    if ( 'function' === typeof cb ) cb(null, true);
    return true;
};

MemoryCache[PROTO].get = function( key, cb ) {
    var ret;
    if ( !_.isset(this._cache, this.prefix+key, true) )
    {
        ret = false;
    }
    else
    {
        var data = this._cache[this.prefix+key];

        if ( !data || _.time() > data[0] )
        {
            delete this._cache[this.prefix+key];
            ret = false;
        }
        else
        {
            ret = data[1];
        }
    }
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

MemoryCache[PROTO].remove = function( key, cb ) {
    var ret;
    if ( !_.isset(this._cache, this.prefix+key) )
    {
        ret = false;
    }
    else
    {
        delete this._cache[this.prefix+key];
        ret = true;
    }
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

MemoryCache[PROTO].clear = function( cb ) {
    if ( !this.prefix.length )
    {
        this._cache = {};
    }
    else
    {
        for(key in this._cache)
        {
            if ( !_.isset(this._cache, key) ) continue;
            if ( 0===key.indexOf(this.prefix) )
            {
                delete this._cache[key];
            }
        }
    }
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

MemoryCache[PROTO].gc = function( maxlifetime, cb ) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, data;
    for(key in this._cache)
    {
        if ( !_.isset(this._cache, key) ) continue;
        if ( !pl || 0===key.indexOf(this.prefix) )
        {
            data = this._cache[key];
            if ( data[0]-currenttime < maxlifetime )
                delete this._cache[key];
        }
    }
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

return MemoryCache;

}(UNICACHE);



!function(UNICACHE){
"use strict";

var PROTO = 'prototype', PREFIX = 'UNICACHE_', _ = UNICACHE._;

function rawurldecode( str )
{
    return decodeURIComponent( String(str) );
}
function rawurlencode( str )
{
    return encodeURIComponent( String(str) )
        .split('!').join('%21')
        .split("'").join('%27')
        .split('(').join('%28')
        .split(')').join('%29')
        .split('*').join('%2A')
        //.split('~').join('%7E')
    ;        
}
function urldecode( str )
{ 
    return rawurldecode( String(str).split('+').join('%20') ); 
}
function urlencode( str )
{
    return rawurlencode( String(str) ).split('%20').join('+');
}

function parseCookies(cookies)
{
    var jar = {}, i, l, cookie, key, value, kv;
    cookies = (cookies || document.cookie || '').split(';');
    for(i=0,l=cookies.length; i<l; i++) {
        cookie = cookies[i];
        if (-1 === cookie.indexOf('=')) {
            //key = _.trim(cookie);
            //value = true;
            continue;
        } else {
            kv = _.trim(cookie).split('=', 2);
            key = _.trim(kv[0]);
            value = _.trim(kv[1]);
        }
        key = urldecode(key);
        if ( (0 === key.indexOf(PREFIX)) && (key.length > PREFIX.length) )
        {
            value = urldecode(value);
            jar[key.slice(PREFIX.length)] = _.unserialize(value);
        }
    }

    return jar;
}

function setCookie(cookie)
{
    var isRaw = !!cookie.raw, str = (isRaw ? PREFIX+String(cookie.name) : urlencode(PREFIX+String(cookie.name)))+'=';

    if (null == cookie.value || '' === cookie.value/* || -1 === cookie.expires*/) {
        str += 'deleted; expires='+(new Date(/*'D, d-M-Y H:i:s T',*/(_.time() - 31536001)*1000).toUTCString());
    } else {
        str += isRaw ? String(cookie.value) : rawurlencode(cookie.value);

        if (0 !== cookie.expires /*&& -1 !== cookie.expires*/ ) {
            str += '; expires='+(new Date(/*'D, d-M-Y H:i:s T',*/1000*cookie.expires).toUTCString());
        }
    }

    if (cookie.path) {
        str += '; path='+String(cookie.path);
    }

    if (cookie.domain) {
        str += '; domain='+String(cookie.domain);
    }

    /*if (true === cookie.secure) {
        str += '; secure';
    }

    if (true === cookie.httponly) {
        str += '; httponly';
    }

    if (null != cookie.sameSite) {
        str += '; samesite='+cookie.sameSite;
    }*/

    return document.cookie = str;
}

function removeCookie(name)
{
    setCookie({name:name,value:null});
}

var CookieCache = UNICACHE.CookieCache = function( ) {
    this._cookie = parseCookies();
};

// extend UNICACHE.Cache class
CookieCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

CookieCache.isSupported = function( ) {
    return true;
};

CookieCache[PROTO]._cookie = null;

CookieCache[PROTO].dispose = function( ) {
    this._cookie = null;
};

CookieCache[PROTO].supportsSync = function( ) {
    // can read/write/etc using sync operations as well
    return true;
};

CookieCache[PROTO].put = function( key, data, ttl, cb ) {
    var k = this.prefix+key, v = [_.time()+ttl,data];
    this._cookie[k] = v;
    setCookie({name:k,value:_.serialize(v),expires:v[0]});
    if ( 'function' === typeof cb ) cb(null, true);
    return true;
};

CookieCache[PROTO].get = function( key, cb ) {
    var ret;
    if ( !_.isset(this._cookie, this.prefix+key, true) )
    {
        ret = false;
    }
    else
    {
        var data = this._cookie[this.prefix+key];

        if ( !data || _.time() > data[0] )
        {
            delete this._cookie[this.prefix+key];
            removeCookie(this.prefix+key);
            ret = false;
        }
        else
        {
            ret = data[1];
        }
    }
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

CookieCache[PROTO].remove = function( key, cb ) {
    var ret;
    if ( !_.isset(this._cookie, this.prefix+key) )
    {
        ret = false;
    }
    else
    {
        delete this._cookie[this.prefix+key];
        removeCookie(this.prefix+key);
        ret = true;
    }
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

CookieCache[PROTO].clear = function( cb ) {
    for(var key in this._cookie)
    {
        if ( !_.isset(this._cookie, key) ) continue;
        if ( !this.prefix.length || 0===key.indexOf(this.prefix) )
        {
            delete this._cookie[key];
            removeCookie(key);
        }
    }
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

CookieCache[PROTO].gc = function( maxlifetime, cb ) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, data;
    for(key in this._cookie)
    {
        if ( !_.isset(this._cookie, key) ) continue;
        if ( !pl || 0===key.indexOf(this.prefix) )
        {
            data = this._cookie[key];
            if ( data[0]-currenttime < maxlifetime )
            {
                delete this._cookie[key];
                removeCookie(key);
            }
        }
    }
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

return CookieCache;

}(UNICACHE);



!function(UNICACHE){
"use strict";

var PROTO = 'prototype', PREFIX = 'UNICACHE_', EXPIRE = 'UNICACHEEXPIRES_', _ = UNICACHE._,
    ROOT = 'undefined' !== typeof window ? window : ('undefined' !== typeof self ? self : this)
;
function supportsStorage(type)
{

    type = type || 'localStorage';
    if ( !(type in ROOT) ) return false;
    try {
        // Create a test value and attempt to set, get and remove the
        // value. These are the core functionality required by locache
        var test_val = "___UNICACHE___";
        ROOT[type].setItem(test_val, test_val);
        ROOT[type].getItem(test_val);
        ROOT[type].removeItem(test_val);
        // If any of the checks fail, an exception will be raised. At
        // that point we can flag the browser as not supporting
        // localStorage or sessionStorage.
        return true;
    } catch (e) {
        return false;
    }

}

function set(key, value, expires)
{
    ROOT.localStorage.setItem(PREFIX+key, value);
    ROOT.localStorage.setItem(EXPIRE+key, +expires);
}

function get(key)
{
    return {data: ROOT.localStorage.getItem(PREFIX+key), expires: getExpires(key)};
}

function getExpires(key)
{
    var expires = ROOT.localStorage.getItem(EXPIRE+key);
    return expires ? parseInt(expires, 10) : null;
}

function del(key)
{
    ROOT.localStorage.removeItem(PREFIX+key);
    ROOT.localStorage.removeItem(EXPIRE+key);
}

var LocalStorageCache = UNICACHE.LocalStorageCache = function( ) {
};

// extend UNICACHE.Cache class
LocalStorageCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

LocalStorageCache.isSupported = function( ) {
    return supportsStorage('localStorage');
};

LocalStorageCache[PROTO].supportsSync = function( ) {
    // can read/write/etc using sync operations as well
    return true;
};

LocalStorageCache[PROTO].put = function( key, data, ttl, cb ) {
    var v = [_.time()+ttl,data];
    set(this.prefix+key, _.serialize(v), v[0]);
    if ( 'function' === typeof cb ) cb(null, true);
    return true;
};

LocalStorageCache[PROTO].get = function( key, cb ) {
    var ret, v = get(this.prefix + key), now = _.time();
    if ( v.data )
    {
        v.data = _.unserialize(v.data);
        if ( !v.data || v.data[0] < now || v.expires < now )
        {
            del(this.prefix + key);
            ret = false;
        }
        else
        {
            ret = v.data[1];
        }
    }
    else
    {
        ret = false;
    }
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

LocalStorageCache[PROTO].remove = function( key, cb ) {
    var ret = true;
    del(this.prefix + key);
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

LocalStorageCache[PROTO].clear = function( cb ) {
    var todel = [];
    for(var key,i=0,l=ROOT.localStorage.length; i<l; i++)
    {
        key = ROOT.localStorage.key(i);
        if ( 0 !== key.indexOf(PREFIX) ) continue;
        key = key.slice(PREFIX.length);
        if ( !this.prefix.length || 0===key.indexOf(this.prefix) )
        {
            todel.push(key);
        }
    }
    todel.map(function(key){del(key);});
    
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

LocalStorageCache[PROTO].gc = function( maxlifetime, cb ) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, todel = [];
    for(var key,i=0,l=ROOT.localStorage.length; i<l; i++)
    {
        key = ROOT.localStorage.key(i);
        if ( 0 !== key.indexOf(EXPIRE) ) continue;
        key = key.slice(EXPIRE.length);
        if ( !pl || 0===key.indexOf(this.prefix) )
        {
            if ( getExpires(key)-currenttime < maxlifetime )
                todel.push(key);
        }
    }
    todel.map(function(key){del(key);});
    
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

return LocalStorageCache;

}(UNICACHE);

!function(UNICACHE){
"use strict";

var PROTO = 'prototype', PREFIX = 'UNICACHE_', EXPIRE = 'UNICACHEEXPIRES_', _ = UNICACHE._,
    ROOT = 'undefined' !== typeof window ? window : ('undefined' !== typeof self ? self : this)
;
function supportsStorage(type)
{

    type = type || 'localStorage';
    if ( !(type in ROOT) ) return false;
    try {
        // Create a test value and attempt to set, get and remove the
        // value. These are the core functionality required by locache
        var test_val = "___UNICACHE___";
        ROOT[type].setItem(test_val, test_val);
        ROOT[type].getItem(test_val);
        ROOT[type].removeItem(test_val);
        // If any of the checks fail, an exception will be raised. At
        // that point we can flag the browser as not supporting
        // localStorage or sessionStorage.
        return true;
    } catch (e) {
        return false;
    }

}

function set(key, value, expires)
{
    ROOT.sessionStorage.setItem(PREFIX+key, value);
    ROOT.sessionStorage.setItem(EXPIRE+key, +expires);
}

function get(key)
{
    return {data: ROOT.sessionStorage.getItem(PREFIX+key), expires: getExpires(key)};
}

function getExpires(key)
{
    var expires = ROOT.sessionStorage.getItem(EXPIRE+key);
    return expires ? parseInt(expires, 10) : null;
}

function del(key)
{
    ROOT.sessionStorage.removeItem(PREFIX+key);
    ROOT.sessionStorage.removeItem(EXPIRE+key);
}

var SessionStorageCache = UNICACHE.SessionStorageCache = function( ) {
};

// extend UNICACHE.Cache class
SessionStorageCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

SessionStorageCache.isSupported = function( ) {
    return supportsStorage('sessionStorage');
};

SessionStorageCache[PROTO].supportsSync = function( ) {
    // can read/write/etc using sync operations as well
    return true;
};

SessionStorageCache[PROTO].put = function( key, data, ttl, cb ) {
    var v = [_.time()+ttl,data];
    set(this.prefix+key, _.serialize(v), v[0]);
    if ( 'function' === typeof cb ) cb(null, true);
    return true;
};

SessionStorageCache[PROTO].get = function( key, cb ) {
    var ret, v = get(this.prefix + key), now = _.time();
    if ( v.data )
    {
        v.data = _.unserialize(v.data);
        if ( !v.data || v.data[0] < now || v.expires < now )
        {
            del(this.prefix + key);
            ret = false;
        }
        else
        {
            ret = v.data[1];
        }
    }
    else
    {
        ret = false;
    }
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

SessionStorageCache[PROTO].remove = function( key, cb ) {
    var ret = true;
    del(this.prefix + key);
    if ( 'function' === typeof cb )
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

SessionStorageCache[PROTO].clear = function( cb ) {
    var todel = [];
    for(var key,i=0,l=ROOT.sessionStorage.length; i<l; i++)
    {
        key = ROOT.sessionStorage.key(i);
        if ( 0 !== key.indexOf(PREFIX) ) continue;
        key = key.slice(PREFIX.length);
        if ( !this.prefix.length || 0===key.indexOf(this.prefix) )
        {
            todel.push(key);
        }
    }
    todel.map(function(key){del(key);});
    
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

SessionStorageCache[PROTO].gc = function( maxlifetime, cb ) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, todel = [];
    for(var key,i=0,l=ROOT.sessionStorage.length; i<l; i++)
    {
        key = ROOT.sessionStorage.key(i);
        if ( 0 !== key.indexOf(EXPIRE) ) continue;
        key = key.slice(EXPIRE.length);
        if ( !pl || 0===key.indexOf(this.prefix) )
        {
            if ( getExpires(key)-currenttime < maxlifetime )
                todel.push(key);
        }
    }
    todel.map(function(key){del(key);});
    
    if ( 'function' === typeof cb )
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

return SessionStorageCache;

}(UNICACHE);

!function(UNICACHE){
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var IndexedDbCache = UNICACHE.IndexedDbCache = function( ) {
};

// extend UNICACHE.Cache class
IndexedDbCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

IndexedDbCache.isSupported = function( ) {
    return false;
};

}(UNICACHE);


!function(UNICACHE){
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var WebSqlCache = UNICACHE.WebSqlCache = function( ) {
};

// extend UNICACHE.Cache class
WebSqlCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

WebSqlCache.isSupported = function( ) {
    return false;
};

}(UNICACHE);


// export it
return UNICACHE;
});
