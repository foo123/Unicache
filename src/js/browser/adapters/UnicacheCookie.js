!function(UNICACHE){
"use strict";

var PROTO = 'prototype', _ = UNICACHE._;

var CookieCache = UNICACHE.CookieCache = function( ) {
};

// extend UNICACHE.Cache class
CookieCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

CookieCache.isSupported = function( ) {
    return true;
};


}(UNICACHE);