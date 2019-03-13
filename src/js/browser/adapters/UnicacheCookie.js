!function(UNICACHE){
"use strict";

var PROTO = 'prototype', PREFIX = 'UNICACHE_', _ = UNICACHE._;

function rawurldecode( str )
{
    return decodeURIComponent( String(str) );
}
function rawurlencode( str )
{
    return encodeURIComponent( String(str) )
        .split('!').join('%21')
        .split("'").join('%27')
        .split('(').join('%28')
        .split(')').join('%29')
        .split('*').join('%2A')
        //.split('~').join('%7E')
    ;        
}
function urldecode( str )
{ 
    return rawurldecode( String(str).split('+').join('%20') ); 
}
function urlencode( str )
{
    return rawurlencode( String(str) ).split('%20').join('+');
}

function parseCookies(cookies)
{
    var jar = {}, i, l, cookie, key, value, kv;
    cookies = (cookies || document.cookie || '').split(';');
    for(i=0,l=cookies.length; i<l; i++) {
        cookie = cookies[i];
        if (-1 === cookie.indexOf('=')) {
            //key = _.trim(cookie);
            //value = true;
            continue;
        } else {
            kv = _.trim(cookie).split('=', 2);
            key = _.trim(kv[0]);
            value = _.trim(kv[1]);
        }
        key = urldecode(key);
        if ( (0 === key.indexOf(PREFIX)) && (key.length > PREFIX.length) )
        {
            value = urldecode(value);
            jar[key.slice(PREFIX.length)] = _.unserialize(value);
        }
    }

    return jar;
}

function setCookie(cookie)
{
    var isRaw = !!cookie.raw, str = (isRaw ? PREFIX+String(cookie.name) : urlencode(PREFIX+String(cookie.name)))+'=';

    if (null == cookie.value || '' === cookie.value/* || -1 === cookie.expires*/) {
        str += 'deleted; expires='+(new Date(/*'D, d-M-Y H:i:s T',*/(_.time() - 31536001)*1000).toUTCString());
    } else {
        str += isRaw ? String(cookie.value) : rawurlencode(cookie.value);

        if (0 !== cookie.expires /*&& -1 !== cookie.expires*/ ) {
            str += '; expires='+(new Date(/*'D, d-M-Y H:i:s T',*/1000*cookie.expires).toUTCString());
        }
    }

    if (cookie.path) {
        str += '; path='+String(cookie.path);
    }

    if (cookie.domain) {
        str += '; domain='+String(cookie.domain);
    }

    /*if (true === cookie.secure) {
        str += '; secure';
    }

    if (true === cookie.httponly) {
        str += '; httponly';
    }

    if (null != cookie.sameSite) {
        str += '; samesite='+cookie.sameSite;
    }*/

    return document.cookie = str;
}

function removeCookie(name)
{
    setCookie({name:name,value:null});
}

var CookieCache = UNICACHE.CookieCache = function( ) {
    this._cookie = parseCookies();
};

// extend UNICACHE.Cache class
CookieCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

CookieCache.isSupported = function( ) {
    return true;
};

CookieCache[PROTO]._cookie = null;

CookieCache[PROTO].dispose = function( ) {
    this._cookie = null;
};

CookieCache[PROTO].supportsSync = function( ) {
    // can read/write/etc using sync operations as well
    return true;
};

CookieCache[PROTO].put = function( key, data, ttl, cb ) {
    var k = this.prefix+key, v = [_.time()+ttl,data];
    this._cookie[k] = v;
    setCookie({name:k,value:_.serialize(v),expires:v[0]});
    if ( 'function' === typeof cb ) cb(null, true);
    return true;
};

CookieCache[PROTO].get = function( key, cb ) {
    var ret;
    if ( !_.isset(this._cookie, this.prefix+key, true) )
    {
        ret = false;
    }
    else
    {
        var data = this._cookie[this.prefix+key];

        if ( !data || _.time() > data[0] )
        {
            delete this._cookie[this.prefix+key];
            removeCookie(this.prefix+key);
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

CookieCache[PROTO].remove = function( key, cb ) {
    var ret;
    if ( !_.isset(this._cookie, this.prefix+key) )
    {
        ret = false;
    }
    else
    {
        delete this._cookie[this.prefix+key];
        removeCookie(this.prefix+key);
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

CookieCache[PROTO].clear = function( cb ) {
    for(var key in this._cookie)
    {
        if ( !_.isset(this._cookie, key) ) continue;
        if ( !this.prefix.length || 0===key.indexOf(this.prefix) )
        {
            delete this._cookie[key];
            removeCookie(key);
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

CookieCache[PROTO].gc = function( maxlifetime, cb ) {
    maxlifetime = +maxlifetime;
    var currenttime = _.time(),
        pl = this.prefix.length, data;
    for(key in this._cookie)
    {
        if ( !_.isset(this._cookie, key) ) continue;
        if ( !pl || 0===key.indexOf(this.prefix) )
        {
            data = this._cookie[key];
            if ( data[0]-currenttime < maxlifetime )
            {
                delete this._cookie[key];
                removeCookie(key);
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

return CookieCache;

}(UNICACHE);