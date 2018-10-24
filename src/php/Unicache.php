<?php
/**
*  Unicache
*  An agnostic caching framework for PHP, Python, Node/JS
*
*  @version: 1.0.0
*  https://github.com/foo123/Unicache
*
**/

if ( !class_exists('UNICACHE_Cache', false) )
{
abstract class UNICACHE_Cache
{
    abstract function get( $key );
    abstract function put( $key, $data, $ttl );
    abstract function remove( $key );
}

class UNICACHE_Factory
{
    const VERSION = '1.0.0';
    public static function getCache( $config )
    {
        $backend = strtoupper($config['cacheType']);
        $cache = null;
        switch( $backend )
        {
            case 'FILE': 
                require_once(dirname(__FILE__).'/adapters/UnicacheFile.php');
                $cache = new UNICACHE_FileCache();
                $cache->setCacheDir( $config['FILE']['cacheDir'] );
                break;
            case 'APC': 
                require_once(dirname(__FILE__).'/adapters/UnicacheApc.php');
                $cache = new UNICACHE_APCCache();
                break;
            case 'APCU': 
                require_once(dirname(__FILE__).'/adapters/UnicacheApcu.php');
                $cache = new UNICACHE_APCUCache();
                break;
            case 'XCACHE': 
                require_once(dirname(__FILE__).'/adapters/UnicacheXCache.php');
                $cache = new UNICACHE_XCache();
                break;
            case 'MEMCACHED': 
                require_once(dirname(__FILE__).'/adapters/UnicacheMemcached.php');
                $cache = new UNICACHE_MemcachedCache();
                foreach ((array)$config['MEMCACHED']['servers'] as $srv)
                {
                    $cache->addServer( $srv['host'], $srv['port'], $srv['weight'] );
                }
                break;
            case 'REDIS': 
                require_once(dirname(__FILE__).'/adapters/UnicacheRedis.php');
                $cache = new UNICACHE_RedisCache();
                $cache->server( $config['REDIS']['server']['host'], $config['REDIS']['server']['port'] );
                break;
            default: 
                // default in-memory cache
                require_once(dirname(__FILE__).'/adapters/UnicacheMemory.php');
                $cache = new UNICACHE_MemoryCache();
                break;
        }
        return $cache;
    }
}
}
