!function(UNICACHE){
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var SessionStorageCache = UNICACHE.SessionStorageCache = function( ) {
};

// extend UNICACHE.Cache class
SessionStorageCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

SessionStorageCache.isSupported = function( ) {
    return false;
};


}(UNICACHE);