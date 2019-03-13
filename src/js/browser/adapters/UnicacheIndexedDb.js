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