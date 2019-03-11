"use strict";

module.exports = function( UNICACHE ) {
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
    };

    MemoryCache[PROTO].get = function( key, cb ) {
        var ret
        if ( !_.isset(this._cache, this.prefix+key, true) )
        {
            ret = false;
        }
        else
        {
            data = this._cache[this.prefix+key];

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
};
