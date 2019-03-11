!function(UNICACHE){
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var WebSqlCache = UNICACHE.WebSqlCache = function( ) {
};

// extend UNICACHE.Cache class
WebSqlCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

WebSqlCache.isSupported = function( ) {
    return false;
};


}(UNICACHE);