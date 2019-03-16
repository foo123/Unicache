!function(UNICACHE){
"use strict";

var PROTO = 'prototype',
    DB_NAME = 'unicache_websql_db', DB_STORE_NAME = 'unicache_', DB_VER = '1.0', MAX_SIZE = 2 * 1024 * 1024 /* 2MB */,
    _ = UNICACHE._;

var WebSqlCache = UNICACHE.WebSqlCache = function( ) {
    this.queue = [];
};

function tryExecuteSql(t, sqlStatement, args, cb)
{
    t.executeSql(sqlStatement, args, function(t, res) {
        if ( 'function' === typeof cb ) cb(null, res);
    }, function(t, err) {
        if ( 'function' === typeof cb ) cb(err, null);
    });
}

function set(db, prefix, key, value, expires, cb)
{
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'SELECT * FROM "'+DB_STORE_NAME+prefix+'" WHERE key=? LIMIT 1', [key], function(err, res){
            if ( err )
            {
                if ( 'function' === typeof cb ) cb(err, null);
                return;
            }
            if ( !res || !res.rows.length )
            {
                tryExecuteSql(t, 'INSERT INTO "'+DB_STORE_NAME+prefix+'" (key,value,expires) VALUES(?,?,?)', [key,value,+expires], function(err, res){
                    if ( 'function' === typeof cb ) cb(err, res);
                });
            }
            else
            {
                tryExecuteSql(t, 'UPDATE "'+DB_STORE_NAME+prefix+'" SET value=?,expires=? WHERE key=?', [value,+expires,key], function(err, res){
                    if ( 'function' === typeof cb ) cb(err, res);
                });
            }
    });
    }, function(err) {
        if ( 'function' === typeof cb ) cb(err, null);
    });
}

function get(db, prefix, key, expires, cb)
{
    db.transaction(function(t) {
        if ( null == expires )
        {
            tryExecuteSql(t, 'SELECT * FROM "'+DB_STORE_NAME+prefix+'" WHERE key = ?', [key], function(err, res){
                if ( 'function' === typeof cb )
                    cb(err, res && res.rows.length ? {value:res.rows.item(0).value, expires:res.rows.item(0).expires} : null);
            });
        }
        else
        {
            tryExecuteSql(t, 'SELECT * FROM "'+DB_STORE_NAME+prefix+'" WHERE key = ? AND expires >= ?', [key,+expires], function(err, res){
                if ( 'function' === typeof cb )
                    cb(err, res && res.rows.length ? {value:res.rows.item(0).value, expires:res.rows.item(0).expires} : null);
            });
        }
    }, function(err) {
        if ( 'function' === typeof cb ) cb(err, null);
    });
}

function del(db, prefix, key, cb)
{
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'DELETE FROM "'+DB_STORE_NAME+prefix+'" WHERE key=?', [key], function(err, res){
            if ( 'function' === typeof cb ) cb(err, res);
        });
    }, function(err) {
        if ( 'function' === typeof cb ) cb(err, null);
    });
}

function clear(db, prefix, cb)
{
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'DELETE FROM "'+DB_STORE_NAME+prefix+'"', [], function(err, res){
            if ( 'function' === typeof cb ) cb(err, res);
        });
    }, function(err) {
        if ( 'function' === typeof cb ) cb(err, null);
    });
}

function gc(db, prefix, maxlifetime, currenttime, cb)
{
    if ( null == currenttime ) currenttime = _.time();
    db.transaction(function(t) {
        // insert or update, based if key exists already
        tryExecuteSql(t, 'DELETE FROM "'+DB_STORE_NAME+prefix+'" WHERE expires < ?', [currenttime-maxlifetime], function(err, res){
            if ( 'function' === typeof cb ) cb(err, res);
        });
    }, function(err) {
        if ( 'function' === typeof cb ) cb(err, null);
    });
}

// extend UNICACHE.Cache class
WebSqlCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

WebSqlCache.isSupported = function( ) {
    return 'function' === typeof openDatabase;
};

WebSqlCache[PROTO].db = null;
WebSqlCache[PROTO].err = null;
WebSqlCache[PROTO].queue = null;

WebSqlCache[PROTO].open = function( cb ) {
    var self = this;
    if ( null == self.db )
    {
        if ( 'function' === typeof cb )
            self.queue.push(cb);
        
        try{
            self.db = openDatabase(DB_NAME, DB_VER, 'UNICACHE Cache Database', MAX_SIZE);
        } catch(e) {
            self.err = e;
            self.db = false;
        }
        if ( self.db )
        {
            self.db.transaction(function( t ) {
                // create db table related to passed cache prefix
                // NOTE: cannot change prefix in the middle of operations
                // need to instantiate new instance of WebSqlCache with new prefix
                // this is done to avoid having to run create table on every sql query, in case prefix has changed
                tryExecuteSql(t, 'CREATE TABLE IF NOT EXISTS "'+DB_STORE_NAME+self.prefix+'" (id INTEGER PRIMARY KEY, key unique, value, expires INTEGER)', [], function(err, res) {
                    if ( err ) self.err = err;
                    var queue = self.queue;
                    self.queue = null;
                    queue.map(function(cb){ cb(self.err, self.db); });
                });
            }, function( err ) {
                self.err = err;
                var queue = self.queue;
                self.queue = null;
                queue.map(function(cb){ cb(self.err, self.db); });
            });
        }
        else
        {
            var queue = self.queue;
            self.queue = null;
            queue.map(function(cb){ cb(self.err, self.db); });
        }
    }
    else if ( self.queue )
    {
        if ( 'function' === typeof cb )
            self.queue.push(cb);
    }
    else
    {
        if ( 'function' === typeof cb )
            cb(self.err, self.db);
    }
    return this;
};

WebSqlCache[PROTO].close = function( ) {
    var self = this;
    if ( self.db )
    {
        self.db = null;
    }
    return this;
};

WebSqlCache[PROTO].drop = function( prefix, cb ) {
    var self = this;
    if ( self.db )
    {
        if ( null == prefix ) prefix = self.prefix;
        self.open(function(err, db){
            if ( err )
            {
                if ( 'function' === typeof cb ) cb(err, null);
                return;
            }
            db.transaction(function(t){
                tryExecuteSql(t, 'DROP TABLE IF EXISTS "'+DB_STORE_NAME+prefix+'"', [], function(err, res) {
                    if ( 'function' === typeof cb ) cb(err, res);
                });
            },function(err){
                if ( 'function' === typeof cb ) cb(err, null);
            });
        });
    }
};

WebSqlCache[PROTO].dispose = function( ) {
    this.close();
    this.db = null;
    this.err = null;
    this.queue = null;
    return UNICACHE.Cache[PROTO].dispose.call(this);
};

WebSqlCache[PROTO].put = function( key, value, ttl, cb ) {
    var self = this;
    self.open(function(err, db){
        if ( err )
        {
            if ( 'function' === typeof cb ) cb(err, null);
            return;
        }
        ttl = +ttl;
        set(db, self.prefix, key, _.serialize(value), _.time()+ttl, cb);
    });
};

WebSqlCache[PROTO].get = function( key, cb ) {
    var self = this;
    self.open(function(err, db){
        if ( err )
        {
            if ( 'function' === typeof cb ) cb(err, null);
            return;
        }
        var currenttime = _.time();
        get(db, self.prefix, key, currenttime, function(err, res){
            if ( err )
            {
                if ( 'function' === typeof cb ) cb(err, null);
                return;
            }
            if ( res && res.expires < currenttime )
            {
                del(db, self.prefix, key);
            }
            if ( 'function' === typeof cb )
            {
                if ( !res || res.expires < currenttime )
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

WebSqlCache[PROTO].remove = function( key, cb ) {
    var self = this;
    self.open(function(err, db){
        if ( err )
        {
            if ( 'function' === typeof cb ) cb(err, null);
            return;
        }
        del(db, self.prefix, key, cb);
    });
};

WebSqlCache[PROTO].clear = function( cb ) {
    var self = this;
    self.open(function(err, db){
        if ( err )
        {
            if ( 'function' === typeof cb ) cb(err, null);
            return;
        }
        clear(db, self.prefix, cb);
    });
};

WebSqlCache[PROTO].gc = function( maxlifetime, cb ) {
    var self = this;
    self.open(function(err, db){
        if ( err )
        {
            if ( 'function' === typeof cb ) cb(err, null);
            return;
        }
        maxlifetime = +maxlifetime;
        var currenttime = _.time();
        gc(db, self.prefix, maxlifetime, currenttime, cb);
    });
};

return WebSqlCache;

}(UNICACHE);