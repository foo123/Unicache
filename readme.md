# UNICACHE 

__An agnostic, caching framework for PHP, Node/JS, Python__

```text
 ____ ___      .__                     .__            
|    |   \____ |__| ____ _____    ____ |  |__   ____  
|    |   /    \|  |/ ___\\__  \ _/ ___\|  |  \_/ __ \ 
|    |  /   |  \  \  \___ / __ \\  \___|   Y  \  ___/ 
|______/|___|  /__|\___  >____  /\___  >___|  /\___  >
             \/        \/     \/     \/     \/     \/ 
```
Logo Ascii Art by [Text-to-Ascii Art Generator](http://patorjk.com/software/taag/#p=display&f=Graffiti&t=Unicache)


`python` implementation in progress..


version 1.2.0


### Contents

* [How to use](#how-to-use)
* [Types of Caching Supported](#types-of-caching-supported)
* [Todo](#todo)
* [ChangeLog](#changelog)
* [Notes](#notes)


### How to Use

`PHP`

This is a caching framework for applications that is agnostic and total.

This means that one can use it easily in her web applications that use any given framework or not use any framework at all.  

_Total_ means that the whole requested page is being cached (if used as such), but one can use the cache classes and factories to cache specifiec parts of the requested page also and/or other data.  

The framework is configured by a config file which easily gets together all parameters, like type of caching, time to live, post-cache user defined filtering and per-page user defined cache disable.

A demo is included with the package. One simply adds an include directive and bang you have the most advanced caching.


### Types of Caching Supported

* In-Memory caching (default) `PHP`+`Node`
* File-based caching `PHP`+`Node`
* APC `PHP` only
* APCU `PHP` only
* XCache `PHP` only
* Memcached `PHP`  (requires `Memcache` or `Memcached` extension) + `Node` (requires [`node-memcached`](https://github.com/3rd-Eden/memcached) module, in progress)
* Redis `PHP`+`Node` (requires [`node-redis`](https://github.com/NodeRedis/node_redis) module)
* it is very easy to extend to other methods as well.


### TODO

* add `python` implementations
* add support for Redis [DONE]
* add support for xCache [DONE]


### ChangeLog


### Notes

Part of the (`php`) code was originally based on code from:  http://www.rooftopsolutions.nl/blog/107


*UNICACHE* is also part of PHP classes http://www.phpclasses.org/package/7530-PHP-Cache-data-in-files-APC-or-Memcached.html

