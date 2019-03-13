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