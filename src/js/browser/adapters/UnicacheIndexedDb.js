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