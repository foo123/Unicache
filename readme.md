# UNICACHE 

__An agnostic, caching framework for `PHP`, `Node.js`, `Browser` and `Python`__

![Unicache](/unicache.jpg)

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


version **1.2.0**

**see also:**

* [ModelView](https://github.com/foo123/modelview.js) a simple, fast, powerful and flexible MVVM framework for JavaScript
* [tico](https://github.com/foo123/tico) a tiny, super-simple MVC framework for PHP
* [LoginManager](https://github.com/foo123/LoginManager) a simple, barebones agnostic login manager for PHP, JavaScript, Python
* [SimpleCaptcha](https://github.com/foo123/simple-captcha) a simple, image-based, mathematical captcha with increasing levels of difficulty for PHP, JavaScript, Python
* [Dromeo](https://github.com/foo123/Dromeo) a flexible, and powerful agnostic router for PHP, JavaScript, Python
* [PublishSubscribe](https://github.com/foo123/PublishSubscribe) a simple and flexible publish-subscribe pattern implementation for PHP, JavaScript, Python
* [Importer](https://github.com/foo123/Importer) simple class &amp; dependency manager and loader for PHP, JavaScript, Python
* [Contemplate](https://github.com/foo123/Contemplate) a fast and versatile isomorphic template engine for PHP, JavaScript, Python
* [HtmlWidget](https://github.com/foo123/HtmlWidget) html widgets, made as simple as possible, both client and server, both desktop and mobile, can be used as (template) plugins and/or standalone for PHP, JavaScript, Python (can be used as [plugins for Contemplate](https://github.com/foo123/Contemplate/blob/master/src/js/plugins/plugins.txt))
* [Paginator](https://github.com/foo123/Paginator)  simple and flexible pagination controls generator for PHP, JavaScript, Python
* [Formal](https://github.com/foo123/Formal) a simple and versatile (Form) Data validation framework based on Rules for PHP, JavaScript, Python
* [Dialect](https://github.com/foo123/Dialect) a cross-vendor &amp; cross-platform SQL Query Builder, based on [GrammarTemplate](https://github.com/foo123/GrammarTemplate), for PHP, JavaScript, Python
* [DialectORM](https://github.com/foo123/DialectORM) an Object-Relational-Mapper (ORM) and Object-Document-Mapper (ODM), based on [Dialect](https://github.com/foo123/Dialect), for PHP, JavaScript, Python
* [Unicache](https://github.com/foo123/Unicache) a simple and flexible agnostic caching framework, supporting various platforms, for PHP, JavaScript, Python
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support), based on [GrammarTemplate](https://github.com/foo123/GrammarTemplate), for PHP, JavaScript, Python
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for PHP, JavaScript, Python


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


`Node.js`

Supports both `node-style` callback-based methods (nodebacks) plus promise-based methods (if `Promises` are supported). Each method (i.e `get`, `put`, `remove`, `clear`, `gc`) has an associated method that returns a promise (i.e `getPromise`, `putPromise`, `removePromise`, `clearPromise`, `gcPromise`). Also some cache types (i.e memory-based and file-based) support `synchronous` operations as well (if no callback is provided synchronous processing takes place).


`Browser`, `Client-side`

Supports both callback-based methods plus promise-based methods (if `Promises` are supported). Each method (i.e `get`, `put`, `remove`, `clear`, `gc`) has an associated method that returns a promise (i.e `getPromise`, `putPromise`, `removePromise`, `clearPromise`, `gcPromise`). Also some cache types (i.e memory-based, cookie-based, webStorage-based) support `synchronous` operations as well (if no callback is provided synchronous processing takes place).


### Types of Caching Supported

**server-side**

* `In-Memory` caching (default) **`PHP`** + **`Node`**
* `File`-based caching **`PHP`** + **`Node`**
* `APC` **`PHP`** only
* `APCU` **`PHP`** only (requires `apcu` extension)
* `XCache` **`PHP`** only (requires `xcache` extension)
* `Memcached` **`PHP`**  (requires `Memcache` or `Memcached` extension) + **`Node`** (requires [`node-memcached`](https://github.com/3rd-Eden/memcached) module, `.clear()` method in progress)
* `Redis` **`PHP`** + **`Node`** (requires [`node-redis`](https://github.com/NodeRedis/node_redis) module)
* it is easy to extend to other methods as well.

**client-side, browser**

* `In-Memory` caching (default)
* `Cookie`-based caching
* `LocalStorage`
* `SessionStorage`
* `IndexedDb`-based caching
* `WebSql`-based caching (supported only on some browers, eg Chrome)
* it is easy to extend to other methods as well.


### TODO

* add `python` implementations
* add client-side/browser support for `webSql` caching [DONE]
* add support for Redis [DONE]
* add support for xCache [DONE]
* `node.js` and `browser` cache manipulation methods use standard callbacks (i.e as last argument w/ signature: `function(err,result)`) [DONE] and also promises (via same method names with "`Promise`" suffix) [DONE]


### ChangeLog


### Notes

Part of the (`php`) code was originally based on code from:  http://www.rooftopsolutions.nl/blog/107


*UNICACHE* is also part of PHP classes http://www.phpclasses.org/package/7530-PHP-Cache-data-in-files-APC-or-Memcached.html

