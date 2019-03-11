!function(UNICACHE){
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var LocalStorageCache = UNICACHE.LocalStorageCache = function( ) {
};

// extend UNICACHE.Cache class
LocalStorageCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

LocalStorageCache.isSupported = function( ) {
    return true;
};


}(UNICACHE);