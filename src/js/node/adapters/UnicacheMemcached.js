"use strict";

module.exports = function(UNICACHE) {
    var PROTO = 'prototype', _ = UNICACHE._, MemCached = null;

    // requires [`node-memcached`](https://github.com/3rd-Eden/memcached) module
    try{
        MemCached = require('memcached');
    } catch(e) {
        MemCached = null;
    }

    var MemcachedCache = UNICACHE.MemcachedCache = function() {
        this.connection = null;
        this.servers = 'localhost:11211';
        this.options = null;
    };

    // extend UNICACHE.Cache class
    MemcachedCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

    MemcachedCache.isSupported = function() {
        return !!Memcached;
    };

    MemcachedCache[PROTO].servers = 'localhost:11211';
    MemcachedCache[PROTO].options = null;
    MemcachedCache[PROTO].connection = null;

    MemcachedCache[PROTO].connect = function() {
        if (!this.connection)
        {
            this.connection = new Memcached(this.servers, this.options);
        }
        return this;
    };

    MemcachedCache[PROTO].dispose = function() {
        if (this.connection)
        {
            this.connection.end();
            this.connection = null;
        }
        return UNICACHE.Cache[PROTO].dispose.call(this);
    };

    MemcachedCache[PROTO].setOptions = function(options) {
        this.options = options || this.options;
        return this;
    };

    MemcachedCache[PROTO].setServers = function(servers) {
        this.servers = servers || this.servers;
        return this;
    };

    MemcachedCache[PROTO].put = function(key, data, ttl, cb) {
        ttl = +ttl;
        this.connect().connection.set(this.prefix + key, _.serialize([_.time() + ttl, data]), ttl, function(err, res) {
            if ('function' === typeof cb) cb(err, res);
        });
    };

    MemcachedCache[PROTO].get = function(key, cb) {
        this.connect().connection.get(this.prefix + key, function(err, data) {
            if ('function' === typeof cb)
            {
                if (err || !data)
                {
                    cb(err, false);
                }
                else
                {
                    data = _.unserialize(data);
                    if (!data || (_.time() > data[0]))
                    {
                        cb(null, false);
                    }
                    else
                    {
                        cb(null, data[1]);
                    }
                }
            }
        });
    };

    MemcachedCache[PROTO].remove = function(key, cb) {
        this.connect().connection.del(this.prefix + key, function(err, res) {
            if ('function' === typeof cb) cb(err, res);
        });
    };

    MemcachedCache[PROTO].clear = function(cb) {
        // TODO
        if ('function' === typeof cb) cb(null, true);
    };

    MemcachedCache[PROTO].gc = function(maxlifetime, cb) {
        // handled automatically
        if ('function' === typeof cb) cb(null, true);
    };

    return MemcachedCache;
};
