/**
*  Unicache
*  An agnostic caching framework for PHP, JavaScript, Python
*
*  @version: 1.3.0
*  https://github.com/foo123/Unicache
*
**/
!function( root, name, factory ){
"use strict";
if (('object'===typeof module)&&module.exports) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if (('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/) /* AMD */
    define(name,['module'],function(module) {factory.moduleUri = module.uri; return factory.call(root);});
else if (!(name in root)) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function() {return root[name];} );
}(/* current root */          'undefined' !== typeof self ? self : this,
  /* module name */           "UNICACHE",
  /* module factory */        function ModuleFactory__UNICACHE(undef) {
"use strict";

var VERSION = '1.3.0', PROTO = 'prototype', NotImplemented = new Error("Not Implemented!");

var UNICACHE = {};
UNICACHE.Cache = function() {};
UNICACHE.Cache[PROTO] = {

    constructor: UNICACHE.Cache,

    dispose: function() {
        return this;
    },

    supportsSync: function() {
        // whether this cache type supports sync operations
        // else a callback needs to be provided (as last argument in standard manner)
        return false;
    },

    prefix: '',
    setPrefix: function(prefix) {
        this.prefix = !!prefix ? String(prefix) : '';
        return this;
    },

    // NOTE: All following cache manipulation methods can be "promisified" if wanted
    // since they use callbacks in standard manner i.e as last arguments with signature: function(err, result)
    // abstract methods, need implementation
    get: function(key, cb) {
        throw NotImplemented;
    },
    put: function(key, data, ttl, cb) {
        throw NotImplemented;
    },
    remove: function(key, cb) {
        throw NotImplemented;
    },
    clear: function(cb) {
        throw NotImplemented;
    },
    gc: function(maxlifetime, cb) {
        throw NotImplemented;
    },

    // promisified methods
    getPromise: function(key) {
        var self = this;
        if ('function' === typeof Promise)
        {
            return new Promise(function(resolve, reject) {
                self.get(key, function(err, res) {
                    if (err) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    putPromise: function(key, data, ttl) {
        var self = this;
        if ('function' === typeof Promise)
        {
            return new Promise(function(resolve, reject) {
                self.put(key, data, ttl, function(err, res) {
                    if (err) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    removePromise: function(key) {
        var self = this;
        if ('function' === typeof Promise)
        {
            return new Promise(function(resolve, reject) {
                self.remove(key, function(err, res) {
                    if (err) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    clearPromise: function() {
        var self = this;
        if ('function' === typeof Promise)
        {
            return new Promise(function(resolve, reject) {
                self.clear(function(err, res){
                    if (err) reject(err);
                    else resolve(res);
                });
            });
        }
        return null;
    },
    gcPromise: function(maxlifetime) {
        var self = this;
        if ('function' === typeof Promise)
        {
            return new Promise(function(resolve, reject) {
                self.gc(maxlifetime, function(err, res) {
                    if (err) reject(err);
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

    time: function() {
        return Math.floor(new Date().getTime() / 1000);
    },
    serialize: function(data) {
        return JSON.stringify(data);
    },
    unserialize: function(data) {
        return JSON.parse(data);
    },
    isset: function(o, k, strict) {
        var exists = !!(o && Object.prototype.hasOwnProperty.call(o, k));
        return true === strict ? exists && (null != o[k]) : exists;
    },
    trim: function(str, charlist) {
      var re;
      if (2 > arguments.length)
      {
          if (!this.TRIM_RE)
              this.TRIM_RE = new RegExp('^[' + ' \\s\u00A0' + ']+|[' + ' \\s\u00A0' + ']+$', 'g');
          re = this.TRIM_RE;
      }
      else
      {
          charlist = String(charlist).replace(this.ESC_RE, '\\$1');
          re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
      }
      return String(str).replace(re, '')
    },
    ltrim: function(str, charlist) {
      var re;
      if (2 > arguments.length)
      {
          if (!this.LTRIM_RE)
              this.LTRIM_RE = new RegExp('^[' + ' \\s\u00A0' + ']+', 'g');
          re = this.LTRIM_RE;
      }
      else
      {
          charlist = String(charlist).replace(this.ESC_RE, '\\$1');
          re = new RegExp('^[' + charlist + ']+', 'g');
      }
      return String(str).replace(re, '')
    },
    rtrim: function(str, charlist) {
      var re;
      if (2 > arguments.length)
      {
          if (!this.RTRIM_RE)
              this.RTRIM_RE = new RegExp('[' + ' \\s\u00A0' + ']+$', 'g');
          re = this.RTRIM_RE;
      }
      else
      {
          charlist = String(charlist).replace(this.ESC_RE, '\\$1');
          re = new RegExp('[' + charlist + ']+$', 'g');
      }
      return String(str).replace(re, '')
    }
};

UNICACHE.Factory = function() {};
UNICACHE.Factory.VERSION = VERSION;
UNICACHE.Factory.getCache = function(cfgs) {
    if ('[object Array]' !== Object[PROTO].toString.call(cfgs)) cfgs = [cfgs];
    // try and get the first that is supported
    for (var i=0,n=cfgs.length; i<n; ++i)
    {
        var config = cfgs[i];
        if (!config) continue;
        var backend = _.isset(config, 'cacheType', true) ? String(config['cacheType']).toUpperCase() : 'MEMORY';
        var cache = null;

        switch (backend)
        {
            case 'INDEXEDDB':
                if (!UNICACHE.IndexedDbCache || !UNICACHE.IndexedDbCache.isSupported())
                {
                    //throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
                }
                else
                {
                    cache = new UNICACHE.IndexedDbCache();
                }
                break;
            case 'WEBSQL':
                if (!UNICACHE.WebSqlCache || !UNICACHE.WebSqlCache.isSupported())
                {
                    //throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
                }
                else
                {
                    cache = new UNICACHE.WebSqlCache();
                }
                break;
            case 'SESSIONSTORAGE':
                if (!UNICACHE.SessionStorageCache || !UNICACHE.SessionStorageCache.isSupported())
                {
                    //throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
                }
                else
                {
                    cache = new UNICACHE.SessionStorageCache();
                }
                break;
            case 'LOCALSTORAGE':
                if (!UNICACHE.LocalStorageCache || !UNICACHE.LocalStorageCache.isSupported())
                {
                    //throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
                }
                else
                {
                    cache = new UNICACHE.LocalStorageCache();
                }
                break;
            case 'COOKIE':
                if (!UNICACHE.CookieCache || !UNICACHE.CookieCache.isSupported())
                {
                    //throw new ReferenceError('UNICACHE: Cache "'+backend+'" is NOT supported!');
                }
                else
                {
                    cache = new UNICACHE.CookieCache();
                }
                break;
            case 'MEMORY':
                if (!UNICACHE.MemoryCache || !UNICACHE.MemoryCache.isSupported())
                {
                    //throw new ReferenceError('UNICACHE: Cache "MEMORY" is NOT supported!');
                }
                else
                {
                    cache = new UNICACHE.MemoryCache();
                }
                break;
        }
        if (cache)
        {
            cache.setPrefix( _.isset(config, 'prefix', true) ? config['prefix'] : '' );
            return cache;
        }
    }
    return null;
};

!function(UNICACHE) {
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var MemoryCache = UNICACHE.MemoryCache = function() {
    this._cache = {};
};

// extend UNICACHE.Cache class
MemoryCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

MemoryCache.isSupported = function() {
    return true;
};

MemoryCache[PROTO]._cache = null;

MemoryCache[PROTO].dispose = function() {
    this._cache = null;
    return UNICACHE.Cache[PROTO].dispose.call(this);
};

MemoryCache[PROTO].supportsSync = function() {
    // can read/write/etc using sync operations as well
    return true;
};

MemoryCache[PROTO].put = function(key, data, ttl, cb) {
    this._cache[this.prefix + key] = [_.time() + ttl, data];
    if ('function' === typeof cb) cb(null, true);
    return true;
};

MemoryCache[PROTO].get = function(key, cb) {
    var ret;
    if (!_.isset(this._cache, this.prefix + key, true))
    {
        ret = false;
    }
    else
    {
        var data = this._cache[this.prefix + key];

        if (!data || (_.time() > data[0]))
        {
            delete this._cache[this.prefix + key];
            ret = false;
        }
        else
        {
            ret = data[1];
        }
    }
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

MemoryCache[PROTO].remove = function(key, cb) {
    var ret;
    if (!_.isset(this._cache, this.prefix + key))
    {
        ret = false;
    }
    else
    {
        delete this._cache[this.prefix + key];
        ret = true;
    }
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

MemoryCache[PROTO].clear = function(cb) {
    if (!this.prefix.length)
    {
        this._cache = {};
    }
    else
    {
        for (key in this._cache)
        {
            if (!_.isset(this._cache, key)) continue;
            if (0 === key.indexOf(this.prefix))
            {
                delete this._cache[key];
            }
        }
    }
    if ('function' === typeof cb)
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

MemoryCache[PROTO].gc = function(maxlifetime, cb) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, data;
    for (key in this._cache)
    {
        if (!_.isset(this._cache, key)) continue;
        if (!pl || (0 === key.indexOf(this.prefix)))
        {
            data = this._cache[key];
            if (data[0] < currenttime-maxlifetime)
                delete this._cache[key];
        }
    }
    if ('function' === typeof cb)
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

function rawurldecode(str)
{
    return decodeURIComponent( String(str) );
}
function rawurlencode(str)
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
function urldecode(str)
{
    return rawurldecode( String(str).split('+').join('%20') );
}
function urlencode(str)
{
    return rawurlencode( String(str) ).split('%20').join('+');
}

function parseCookies(cookies)
{
    var jar = {}, i, l, cookie, key, value, kv;
    cookies = (cookies || document.cookie || '').split(';');
    for (i=0,l=cookies.length; i<l; ++i)
    {
        cookie = cookies[i];
        if (-1 === cookie.indexOf('='))
        {
            //key = _.trim(cookie);
            //value = true;
            continue;
        }
        else
        {
            kv = _.trim(cookie).split('=', 2);
            key = _.trim(kv[0]);
            value = _.trim(kv[1]);
        }
        key = urldecode(key);
        if ((0 === key.indexOf(PREFIX)) && (key.length > PREFIX.length))
        {
            value = urldecode(value);
            jar[key.slice(PREFIX.length)] = _.unserialize(value);
        }
    }

    return jar;
}

function setCookie(cookie)
{
    var isRaw = !!cookie.raw, str = (isRaw ? PREFIX+String(cookie.name) : urlencode(PREFIX+String(cookie.name))) + '=';

    if ((null == cookie.value) || ('' === cookie.value)/* || -1 === cookie.expires*/)
    {
        str += 'deleted; expires='+(new Date(/*'D, d-M-Y H:i:s T',*/(_.time() - 31536001)*1000).toUTCString());
    }
    else
    {
        str += isRaw ? String(cookie.value) : rawurlencode(cookie.value);

        if (0 !== cookie.expires /*&& -1 !== cookie.expires*/ )
        {
            str += '; expires='+(new Date(/*'D, d-M-Y H:i:s T',*/1000*cookie.expires).toUTCString());
        }
    }

    if (cookie.path)
    {
        str += '; path='+String(cookie.path);
    }

    if (cookie.domain)
    {
        str += '; domain='+String(cookie.domain);
    }

    /*if (true === cookie.secure)
    {
        str += '; secure';
    }

    if (true === cookie.httponly)
    {
        str += '; httponly';
    }

    if (null != cookie.sameSite)
    {
        str += '; samesite='+cookie.sameSite;
    }*/

    return document.cookie = str;
}

function removeCookie(name)
{
    setCookie({name:name, value:null});
}

var CookieCache = UNICACHE.CookieCache = function() {
    this._cookie = parseCookies();
};

// extend UNICACHE.Cache class
CookieCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

CookieCache.isSupported = function() {
    return true;
};

CookieCache[PROTO]._cookie = null;

CookieCache[PROTO].dispose = function() {
    this._cookie = null;
    return UNICACHE.Cache[PROTO].dispose.call(this);
};

CookieCache[PROTO].supportsSync = function() {
    // can read/write/etc using sync operations as well
    return true;
};

CookieCache[PROTO].put = function(key, data, ttl, cb) {
    var k = this.prefix+key, v = [_.time() + ttl, data];
    this._cookie[k] = v;
    setCookie({name:k, value:_.serialize(v), expires:v[0]});
    if ('function' === typeof cb) cb(null, true);
    return true;
};

CookieCache[PROTO].get = function(key, cb) {
    var ret;
    if (!_.isset(this._cookie, this.prefix + key, true))
    {
        ret = false;
    }
    else
    {
        var data = this._cookie[this.prefix + key];

        if (!data || (_.time() > data[0]))
        {
            delete this._cookie[this.prefix + key];
            removeCookie(this.prefix + key);
            ret = false;
        }
        else
        {
            ret = data[1];
        }
    }
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

CookieCache[PROTO].remove = function(key, cb) {
    var ret;
    if (!_.isset(this._cookie, this.prefix + key))
    {
        ret = false;
    }
    else
    {
        delete this._cookie[this.prefix + key];
        removeCookie(this.prefix + key);
        ret = true;
    }
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

CookieCache[PROTO].clear = function(cb) {
    for (var key in this._cookie)
    {
        if (!_.isset(this._cookie, key)) continue;
        if (!this.prefix.length || (0 === key.indexOf(this.prefix)))
        {
            delete this._cookie[key];
            removeCookie(key);
        }
    }
    if ('function' === typeof cb)
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

CookieCache[PROTO].gc = function(maxlifetime, cb) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, data;
    for (key in this._cookie)
    {
        if (!_.isset(this._cookie, key)) continue;
        if (!pl || (0 === key.indexOf(this.prefix)))
        {
            data = this._cookie[key];
            if (data[0] < currenttime-maxlifetime)
            {
                delete this._cookie[key];
                removeCookie(key);
            }
        }
    }
    if ('function' === typeof cb)
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

!function(UNICACHE) {
"use strict";

var PROTO = 'prototype', PREFIX = 'UNICACHE_', EXPIRE = 'UNICACHEEXPIRES_', _ = UNICACHE._,
    ROOT = 'undefined' !== typeof window ? window : ('undefined' !== typeof self ? self : this)
;
function supportsStorage(type)
{

    type = type || 'localStorage';
    if (!(type in ROOT)) return false;
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
    ROOT.localStorage.setItem(PREFIX + key, value);
    ROOT.localStorage.setItem(EXPIRE + key, +expires);
}

function get(key)
{
    return {data: ROOT.localStorage.getItem(PREFIX + key), expires: getExpires(key)};
}

function getExpires(key)
{
    var expires = ROOT.localStorage.getItem(EXPIRE + key);
    return expires ? parseInt(expires, 10) : null;
}

function del(key)
{
    ROOT.localStorage.removeItem(PREFIX + key);
    ROOT.localStorage.removeItem(EXPIRE + key);
}

var LocalStorageCache = UNICACHE.LocalStorageCache = function() {
};

// extend UNICACHE.Cache class
LocalStorageCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

LocalStorageCache.isSupported = function() {
    return supportsStorage('localStorage');
};

LocalStorageCache[PROTO].supportsSync = function() {
    // can read/write/etc using sync operations as well
    return true;
};

LocalStorageCache[PROTO].put = function(key, data, ttl, cb) {
    var v = [_.time() + ttl, data];
    set(this.prefix + key, _.serialize(v), v[0]);
    if ('function' === typeof cb) cb(null, true);
    return true;
};

LocalStorageCache[PROTO].get = function(key, cb) {
    var ret, v = get(this.prefix + key), now = _.time();
    if (v.data)
    {
        v.data = _.unserialize(v.data);
        if (!v.data || (v.data[0] < now) || (v.expires < now))
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
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

LocalStorageCache[PROTO].remove = function(key, cb) {
    var ret = true;
    del(this.prefix + key);
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

LocalStorageCache[PROTO].clear = function(cb) {
    var todel = [];
    for(var key,i=0,l=ROOT.localStorage.length; i<l; ++i)
    {
        key = ROOT.localStorage.key(i);
        if (0 !== key.indexOf(PREFIX)) continue;
        key = key.slice(PREFIX.length);
        if (!this.prefix.length || (0 === key.indexOf(this.prefix)))
        {
            todel.push(key);
        }
    }
    todel.map(function(key) {del(key);});

    if ('function' === typeof cb)
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

LocalStorageCache[PROTO].gc = function(maxlifetime, cb) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, todel = [];
    for(var key,i=0,l=ROOT.localStorage.length; i<l; ++i)
    {
        key = ROOT.localStorage.key(i);
        if (0 !== key.indexOf(EXPIRE)) continue;
        key = key.slice(EXPIRE.length);
        if (!pl || (0 === key.indexOf(this.prefix)))
        {
            if (getExpires(key) < currenttime-maxlifetime)
                todel.push(key);
        }
    }
    todel.map(function(key) {del(key);});

    if ('function' === typeof cb)
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

!function(UNICACHE) {
"use strict";

var PROTO = 'prototype', PREFIX = 'UNICACHE_', EXPIRE = 'UNICACHEEXPIRES_', _ = UNICACHE._,
    ROOT = 'undefined' !== typeof window ? window : ('undefined' !== typeof self ? self : this)
;
function supportsStorage(type)
{

    type = type || 'localStorage';
    if (!(type in ROOT)) return false;
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
    ROOT.sessionStorage.setItem(PREFIX + key, value);
    ROOT.sessionStorage.setItem(EXPIRE + key, +expires);
}

function get(key)
{
    return {data: ROOT.sessionStorage.getItem(PREFIX + key), expires: getExpires(key)};
}

function getExpires(key)
{
    var expires = ROOT.sessionStorage.getItem(EXPIRE + key);
    return expires ? parseInt(expires, 10) : null;
}

function del(key)
{
    ROOT.sessionStorage.removeItem(PREFIX + key);
    ROOT.sessionStorage.removeItem(EXPIRE + key);
}

var SessionStorageCache = UNICACHE.SessionStorageCache = function() {
};

// extend UNICACHE.Cache class
SessionStorageCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

SessionStorageCache.isSupported = function() {
    return supportsStorage('sessionStorage');
};

SessionStorageCache[PROTO].supportsSync = function() {
    // can read/write/etc using sync operations as well
    return true;
};

SessionStorageCache[PROTO].put = function(key, data, ttl, cb) {
    var v = [_.time() + ttl, data];
    set(this.prefix + key, _.serialize(v), v[0]);
    if ('function' === typeof cb) cb(null, true);
    return true;
};

SessionStorageCache[PROTO].get = function(key, cb) {
    var ret, v = get(this.prefix + key), now = _.time();
    if (v.data)
    {
        v.data = _.unserialize(v.data);
        if (!v.data || (v.data[0] < now) || (v.expires < now))
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
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

SessionStorageCache[PROTO].remove = function(key, cb) {
    var ret = true;
    del(this.prefix + key);
    if ('function' === typeof cb)
    {
        cb(null, ret);
    }
    else
    {
        return ret;
    }
};

SessionStorageCache[PROTO].clear = function(cb) {
    var todel = [];
    for(var key,i=0,l=ROOT.sessionStorage.length; i<l; ++i)
    {
        key = ROOT.sessionStorage.key(i);
        if (0 !== key.indexOf(PREFIX)) continue;
        key = key.slice(PREFIX.length);
        if (!this.prefix.length || (0 === key.indexOf(this.prefix)))
        {
            todel.push(key);
        }
    }
    todel.map(function(key) {del(key);});

    if ('function' === typeof cb)
    {
        cb(null, true);
    }
    else
    {
        return true;
    }
};

SessionStorageCache[PROTO].gc = function(maxlifetime, cb) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, todel = [];
    for(var key,i=0,l=ROOT.sessionStorage.length; i<l; ++i)
    {
        key = ROOT.sessionStorage.key(i);
        if (0 !== key.indexOf(EXPIRE)) continue;
        key = key.slice(EXPIRE.length);
        if (!pl || (0 === key.indexOf(this.prefix)))
        {
            if (getExpires(key) < currenttime-maxlifetime)
                todel.push(key);
        }
    }
    todel.map(function(key) {del(key);});

    if ('function' === typeof cb)
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

var PROTO = 'prototype',
    DB_NAME = 'unicache_websql_db', DB_STORE_NAME = 'unicache_', DB_VER = '1.0', MAX_SIZE = 2 * 1024 * 1024 /* 2MB */,
    _ = UNICACHE._;

var WebSqlCache = UNICACHE.WebSqlCache = function() {
    this.queue = [];
};

function tryExecuteSql(t, sqlStatement, args, cb)
{
    t.executeSql(sqlStatement, args, function(t, res) {
        if ('function' === typeof cb) cb(null, res);
    }, function(t, err) {
        if ('function' === typeof cb) cb(err, null);
    });
}

function set(db, prefix, key, value, expires, cb)
{
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'SELECT * FROM "'+DB_STORE_NAME + prefix+'" WHERE key=? LIMIT 1', [key], function(err, res) {
            if (err)
            {
                if ('function' === typeof cb) cb(err, null);
                return;
            }
            if (!res || !res.rows.length)
            {
                tryExecuteSql(t, 'INSERT INTO "'+DB_STORE_NAME + prefix+'" (key,value,expires) VALUES(?,?,?)', [key,value,+expires], function(err, res) {
                    if ('function' === typeof cb) cb(err, res);
                });
            }
            else
            {
                tryExecuteSql(t, 'UPDATE "'+DB_STORE_NAME + prefix+'" SET value=?,expires=? WHERE key=?', [value,+expires,key], function(err, res) {
                    if ('function' === typeof cb) cb(err, res);
                });
            }
    });
    }, function(err) {
        if ('function' === typeof cb) cb(err, null);
    });
}

function get(db, prefix, key, expires, cb)
{
    db.transaction(function(t) {
        if (null == expires)
        {
            tryExecuteSql(t, 'SELECT * FROM "'+DB_STORE_NAME + prefix+'" WHERE key = ?', [key], function(err, res) {
                if ('function' === typeof cb)
                    cb(err, res && res.rows.length ? {value:res.rows.item(0).value, expires:res.rows.item(0).expires} : null);
            });
        }
        else
        {
            tryExecuteSql(t, 'SELECT * FROM "'+DB_STORE_NAME + prefix+'" WHERE key = ? AND expires >= ?', [key,+expires], function(err, res) {
                if ('function' === typeof cb)
                    cb(err, res && res.rows.length ? {value:res.rows.item(0).value, expires:res.rows.item(0).expires} : null);
            });
        }
    }, function(err) {
        if ('function' === typeof cb) cb(err, null);
    });
}

function del(db, prefix, key, cb)
{
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'DELETE FROM "'+DB_STORE_NAME + prefix+'" WHERE key=?', [key], function(err, res) {
            if ('function' === typeof cb) cb(err, res);
        });
    }, function(err) {
        if ('function' === typeof cb) cb(err, null);
    });
}

function clear(db, prefix, cb)
{
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'DELETE FROM "'+DB_STORE_NAME + prefix+'"', [], function(err, res) {
            if ('function' === typeof cb) cb(err, res);
        });
    }, function(err) {
        if ('function' === typeof cb) cb(err, null);
    });
}

function gc(db, prefix, maxlifetime, currenttime, cb)
{
    if (null == currenttime) currenttime = _.time();
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'DELETE FROM "'+DB_STORE_NAME + prefix+'" WHERE expires < ?', [currenttime-maxlifetime], function(err, res) {
            if ('function' === typeof cb) cb(err, res);
        });
    }, function(err) {
        if ('function' === typeof cb) cb(err, null);
    });
}

// extend UNICACHE.Cache class
WebSqlCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

WebSqlCache.isSupported = function() {
    return 'function' === typeof openDatabase;
};

WebSqlCache[PROTO].db = null;
WebSqlCache[PROTO].err = null;
WebSqlCache[PROTO].queue = null;

WebSqlCache[PROTO].open = function(cb) {
    var self = this;
    if (null == self.db)
    {
        if ('function' === typeof cb)
            self.queue.push(cb);

        try{
            self.db = openDatabase(DB_NAME, DB_VER, 'UNICACHE Cache Database', MAX_SIZE);
        } catch(e) {
            self.err = e;
            self.db = false;
        }
        if (self.db)
        {
            self.db.transaction(function(t) {
                // create db table related to passed cache prefix
                // NOTE: cannot change prefix in the middle of operations
                // need to instantiate new instance of WebSqlCache with new prefix
                // this is done to avoid having to run create table on every sql query, in case prefix has changed
                tryExecuteSql(t, 'CREATE TABLE IF NOT EXISTS "'+DB_STORE_NAME + self.prefix+'" (id INTEGER PRIMARY KEY, key unique, value, expires INTEGER)', [], function(err, res) {
                    if (err) self.err = err;
                    var queue = self.queue;
                    self.queue = null;
                    queue.map(function(cb) {cb(self.err, self.db);});
                });
            }, function(err) {
                self.err = err;
                var queue = self.queue;
                self.queue = null;
                queue.map(function(cb) {cb(self.err, self.db);});
            });
        }
        else
        {
            var queue = self.queue;
            self.queue = null;
            queue.map(function(cb) {cb(self.err, self.db);});
        }
    }
    else if (self.queue)
    {
        if ('function' === typeof cb)
            self.queue.push(cb);
    }
    else
    {
        if ('function' === typeof cb)
            cb(self.err, self.db);
    }
    return this;
};

WebSqlCache[PROTO].close = function() {
    var self = this;
    if (self.db)
    {
        self.db = null;
    }
    return this;
};

WebSqlCache[PROTO].drop = function(prefix, cb) {
    var self = this;
    if (self.db)
    {
        if (null == prefix) prefix = self.prefix;
        self.open(function(err, db) {
            if (err)
            {
                if ('function' === typeof cb) cb(err, null);
                return;
            }
            db.transaction(function(t) {
                tryExecuteSql(t, 'DROP TABLE IF EXISTS "'+DB_STORE_NAME + prefix+'"', [], function(err, res) {
                    if ('function' === typeof cb) cb(err, res);
                });
            },function(err) {
                if ('function' === typeof cb) cb(err, null);
            });
        });
    }
};

WebSqlCache[PROTO].dispose = function() {
    this.close();
    this.db = null;
    this.err = null;
    this.queue = null;
    return UNICACHE.Cache[PROTO].dispose.call(this);
};

WebSqlCache[PROTO].put = function(key, value, ttl, cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
            return;
        }
        ttl = +ttl;
        set(db, self.prefix, key, _.serialize(value), _.time() + ttl, cb);
    });
};

WebSqlCache[PROTO].get = function(key, cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
            return;
        }
        var currenttime = _.time();
        get(db, self.prefix, key, currenttime, function(err, res) {
            if (err)
            {
                if ('function' === typeof cb) cb(err, null);
                return;
            }
            if (res && (res.expires < currenttime))
            {
                del(db, self.prefix, key);
            }
            if ('function' === typeof cb)
            {
                if (!res || (res.expires < currenttime))
                {
                    cb(null, false);
                }
                else
                {
                    cb(null, _.unserialize(res.value));
                }
            }
        });
    });
};

WebSqlCache[PROTO].remove = function(key, cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
            return;
        }
        del(db, self.prefix, key, cb);
    });
};

WebSqlCache[PROTO].clear = function(cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
            return;
        }
        clear(db, self.prefix, cb);
    });
};

WebSqlCache[PROTO].gc = function(maxlifetime, cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
            return;
        }
        maxlifetime = +maxlifetime;
        var currenttime = _.time();
        gc(db, self.prefix, maxlifetime, currenttime, cb);
    });
};

return WebSqlCache;

}(UNICACHE);

!function(UNICACHE) {
"use strict";

var PROTO = 'prototype', _ = UNICACHE._,
    DB_NAME = 'unicache-indexeddb-cache-db',
    DB_VERSION = 1, // Use a long long for this value (don't use a float)
    DB_STORE_NAME = 'unicache_db_store_',
    ROOT = 'undefined' !== typeof window ? window : ('undefined' !== typeof self ? self : this),
    IDB = getIDB()
;
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
function getIDB()
{
    var idb = {db:null, transaction: {READ_WRITE:"readwrite"}, keyrange:null};

    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
    try {
        if (typeof ROOT.indexedDB !== 'undefined')
        {
            idb.db = ROOT.indexedDB;
        }
        else if (typeof ROOT.webkitIndexedDB !== 'undefined')
        {
            idb.db = ROOT.webkitIndexedDB;
        }
        else if (typeof ROOT.mozIndexedDB !== 'undefined')
        {
            idb.db = ROOT.mozIndexedDB;
        }
        else if (typeof ROOT.OIndexedDB !== 'undefined')
        {
            idb.db = ROOT.OIndexedDB;
        }
        else if (typeof ROOT.msIndexedDB !== 'undefined')
        {
            idb.db = ROOT.msIndexedDB;
        }
    } catch (e) {
    }
    try {
        if (typeof ROOT.IDBTransaction !== 'undefined')
        {
            idb.transaction = ROOT.IDBTransaction;
        }
        else if (typeof ROOT.webkitIDBTransaction !== 'undefined')
        {
            idb.transaction = ROOT.webkitIDBTransaction;
        }
        else if (typeof ROOT.msIDBTransaction !== 'undefined')
        {
            idb.transaction = ROOT.msIDBTransaction
        }
    } catch (e) {
    }
    try {
        if (typeof ROOT.IDBKeyRange !== 'undefined')
        {
            idb.keyrange = ROOT.IDBKeyRange;
        }
        else if (typeof ROOT.webkitIDBKeyRange !== 'undefined')
        {
            idb.keyrange = ROOT.webkitIDBKeyRange;
        }
        else if (typeof ROOT.msIDBKeyRange !== 'undefined')
        {
            idb.keyrange = ROOT.msIDBKeyRange
        }
    } catch (e) {
    }

    return idb;
}

var IndexedDbCache = UNICACHE.IndexedDbCache = function() {
    this.queue = [];
};

function set(db, store, key, value, expires, cb)
{
    var request = db.transaction([store], "readwrite").objectStore(store).put([_.time()+expires, value], key);
    request.onerror = function(event) {
        if ('function' === typeof cb) cb(new Error('Setting "'+key+'" failed!'), null);
    };
    request.onsuccess = function(event) {
        if ('function' === typeof cb) cb(null, true);
    };
}

function get(db, store, key, cb)
{
    var request = db.transaction([store], "readonly").objectStore(store).get(key);
    request.onerror = function(event) {
        if ('function' === typeof cb) cb(new Error('Retrieving "'+key+'" failed!'), null);
    };
    request.onsuccess = function(event) {
        if ('function' === typeof cb) cb(null, request.result);
    };
}

function del(db, store, key, cb)
{
    var request = db.transaction([store], "readwrite").objectStore(store).delete(key);
    request.onerror = function(event) {
        if ('function' === typeof cb) cb(new Error('Deleting "'+key+'" failed!'), null);
    };
    request.onsuccess = function(event) {
        if ('function' === typeof cb) cb(null, true);
    };
}

// extend UNICACHE.Cache class
IndexedDbCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

IndexedDbCache.isSupported = function( ) {
    return !!IDB.db;
};
IndexedDbCache[PROTO].request = null;
IndexedDbCache[PROTO].db = null;
IndexedDbCache[PROTO].queue = null;

IndexedDbCache[PROTO].open = function(cb) {
    var self = this;
    if (!self.request)
    {
        if (self.queue && ('function' === typeof cb))
            self.queue.push(cb);

        self.request = IDB.db.open(DB_NAME, DB_VERSION);
        self.request.onerror = function(event) {
            self.db = false;
            if (self.queue)
            {
                var err = new Error('IndexedDB Open Error with code '+self.request.errorCode);
                var queue = self.queue;
                self.queue = null;
                queue.map(function(cb) {cb(err, null);});
            }
        };
        self.request.onblocked = function(event) {
            // If some other tab is loaded with the database, then it needs to be closed
            // before we can proceed.
            console.warn("UNICACHE: Please close all other tabs with this site open!");
        };
        self.request.onupgradeneeded = function(event) {
            var db = event.target.result;
            // Create an objectStore to hold information about any javascript value even primitives.
            var objectStore = db.createObjectStore(DB_STORE_NAME + self.prefix);
        };
        self.request.onsuccess = function(event) {
            self.db = event.target.result;

            self.db.onclose = function(event) {
                self.db = null;
                //alert("A new version of this page is ready. Please reload or close this tab!");
            };

            self.db.onversionchange = function(event) {
                self.db.close();
                self.db = null;
                //alert("A new version of this page is ready. Please reload or close this tab!");
            };

            if (self.queue)
            {
                var queue = self.queue;
                self.queue = null;
                queue.map(function(cb) {cb(null, self.db);});
            }
        };
    }
    else if (null == self.db)
    {
        if (self.queue && ('function' === typeof cb))
            self.queue.push(cb);
    }
    else if (false === self.db)
    {
        if ('function' === typeof cb)
            cb(new Error('IndexedDB cannot be opened'), null);
    }
    else if (self.db)
    {
        if ('function' === typeof cb)
            cb(null, self.db);
    }
    return this;
};

IndexedDbCache[PROTO].close = function() {
    if (this.db)
    {
        this.db.close();
        this.db = null;
    }
    return this;
};

IndexedDbCache[PROTO].dispose = function() {
    this.close();
    this.db = null;
    this.request = null;
    this.queue = null;
    return UNICACHE.Cache[PROTO].dispose.call(this);
};

IndexedDbCache[PROTO].supportsSync = function() {
    return false;
};

IndexedDbCache[PROTO].put = function(key, data, ttl, cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
        }
        else
        {
            set(db, DB_STORE_NAME + self.prefix, key, data, +ttl, function(err, res) {
                if ('function' === typeof cb) cb(err, res);
            });
        }
    });
};

IndexedDbCache[PROTO].get = function(key, cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
        }
        else
        {
            get(db, DB_STORE_NAME + self.prefix, key, function(err, data) {
                if ('function' === typeof cb)
                {
                    if (err) cb(err, null);
                    else if (!data) cb(null, false);
                    else if (data[0] < _.time())
                    {
                        del(db, DB_STORE_NAME + self.prefix, key);
                        cb(null, false);
                    }
                    else cb(null, data[1]);
                }
                else
                {
                    if (!err && data && (data[0] < _.time()))
                    {
                        del(db, DB_STORE_NAME + self.prefix, key);
                    }
                }
            });
        }
    });
};

IndexedDbCache[PROTO].remove = function(key, cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
        }
        else
        {
            del(db, DB_STORE_NAME + self.prefix, key, function(err, res) {
                if ('function' === typeof cb) cb(err, res);
            });
        }
    });
};

IndexedDbCache[PROTO].clear = function(cb) {
    var self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
        }
        else
        {
            var req = db.transaction(DB_STORE_NAME + self.prefix, "readwrite").objectStore(DB_STORE_NAME + self.prefix).clear();
            req.onerror = function(event) {
                if ('function' === typeof cb) cb(new Error('Error clearing store ' + event.target.errorCode), null);
            };
            req.onsuccess = function(event) {
                if ('function' === typeof cb) cb(null, true);
            };
        }
    });
};

IndexedDbCache[PROTO].gc = function(maxlifetime, cb) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(), self = this;
    self.open(function(err, db) {
        if (err)
        {
            if ('function' === typeof cb) cb(err, null);
        }
        else
        {
            var cursor = db.transaction(DB_STORE_NAME + self.prefix, "readwrite").objectStore(DB_STORE_NAME + self.prefix).openCursor();
            var todel = [];
            cursor.onerror = function(event) {
                if ('function' === typeof cb) cb(new Error('Error looping through store ' + event.target.errorCode), null);
            };
            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor)
                {
                    var expires = cursor.value[0];
                    if (expires < currenttime-maxlifetime) todel.push(cursor.key);
                    cursor.continue();
                }
                else
                {
                    // no more entries
                    setTimeout(function() {
                        todel.map(function(key) {
                            del(db, DB_STORE_NAME + self.prefix, key);
                        });
                        if ('function' === typeof cb)
                            cb(null, true);
                    }, 10);
                }
            };
        }
    });
};

return IndexedDbCache;

}(UNICACHE);

// export it
return UNICACHE;
});
