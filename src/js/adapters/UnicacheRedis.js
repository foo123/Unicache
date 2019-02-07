"use strict";

module.exports = function( UNICACHE ) {
    var PROTO = 'prototype', _ = UNICACHE._, Redis = null;

    // requires [`node-redis`](https://github.com/NodeRedis/node_redis) module
    try{
        Redis = require('redis');
    } catch(e) {
        Redis = null;
    }

    var RedisCache = UNICACHE.RedisCache = function( ) {
        this.redis = null;
        this.options = null;
    };

    // extend UNICACHE.Cache class
    RedisCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

    RedisCache[PROTO].redis = null;
    RedisCache[PROTO].options = null;
    RedisCache[PROTO].connect = function( ) {
        if ( !this.redis )
        {
            this.redis = Redis.createClient(this.options);
        }
        return this;
    };
    
    RedisCache[PROTO].dispose = function( ) {
        if ( this.redis )
        {
            this.redis.quit();
            this.redis = null;
        }
        return this;
    };
    
    RedisCache[PROTO].setOptions = function( options ) {
        this.options = options || this.options;
        return this;
    };

    RedisCache.isSupported = function( ) {
        return !!Redis;
    };

    RedisCache[PROTO].put = function( key, data, ttl, cb ) {
        ttl = +ttl;
        this.connect().redis.multi()
            .set(this.prefix+key, _.serialize([_.time()+ttl, data]))
            .expire(this.prefix+key, ttl)
            .exec(function(err, res){
                if ( 'function' === typeof cb ) cb(err ? false : true);
            });
    };

    RedisCache[PROTO].get = function( key, cb ) {
        this.connect().redis.get(this.prefix+key, function(err, data){
            if ( err || !data )
            {
                cb(false);
            }
            else
            {
                data = _.unserialize(data);
                if ( !data || _.time() > data[0] )
                {
                    cb(false);
                }
                else
                {
                    cb(data[1]);
                }
            }
        });
    };

    RedisCache[PROTO].remove = function( key, cb ) {
        this.connect().redis.del(this.prefix+key, function(err, res){
            if ( 'function' === typeof cb ) cb(err ? false : true);
        });
    };

    RedisCache[PROTO].clear = function( cb ) {
        var self = this;
        this.connect().redis.keys(this.prefix+'*', function(err, keys){
            if ( err || !keys || !keys.length )
            {
                if ( 'function' === typeof cb ) cb(err ? false : true);
                return;
            }
            var multi = self.redis.multi();
            for(var i=0,l=keys.length; i<l; i++)
            {
                multi.del(keys[i]);
            }
            multi.exec(function(err, res){
                if ( 'function' === typeof cb ) cb(true);
            });
        });
    };

    RedisCache[PROTO].gc = function( maxlifetime, cb ) {
        // handled automatically
        //this.connect();
        if ( 'function' === typeof cb ) setTimeout(function(){cb(true);}, 100);
    };

    return RedisCache;
};
