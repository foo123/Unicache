<?php
/**
*  Unicache
*  An agnostic caching framework for PHP, JavaScript, Python
*
*  @version: 1.3.0
*  https://github.com/foo123/Unicache
*
**/

if (!class_exists('UNICACHE_Cache', false))
{
abstract class UNICACHE_Cache
{
    abstract public function get($key);
    abstract public function put($key, $data, $ttl);
    abstract public function remove($key);
    abstract public function clear();
    abstract public function gc($maxlifetime);

    protected $prefix = '';
    public function setPrefix($prefix)
    {
        $this->prefix = isset($prefix) ? (string)$prefix : '';
        return $this;
    }
}

class UNICACHE_Factory
{
    const VERSION = "1.3.0";

    public static function getCache($cfgs)
    {
        if (!isset($cfgs[0])) $cfgs = array($cfgs);
        // try and get the first that is supported
        foreach ($cfgs as $config)
        {
            if (!is_array($config)) continue;
            $backend = isset($config['cacheType']) ? strtoupper((string)$config['cacheType']) : 'MEMORY';
            $cache = null;

            switch ($backend)
            {
                case 'FILE':
                    if (!class_exists('UNICACHE_FileCache', false))
                        require_once(dirname(__FILE__) . '/adapters/UnicacheFile.php');
                    if (!UNICACHE_FileCache::isSupported())
                    {
                        //throw new RunTimeException('UNICACHE: Cache "'.$backend.'" is NOT supported!');
                    }
                    else
                    {
                        $cache = new UNICACHE_FileCache();
                        $cache->setCacheDir($config['FILE']['cacheDir']);
                    }
                    break;
                case 'APC':
                    if (!class_exists('UNICACHE_APCCache', false))
                        require_once(dirname(__FILE__) . '/adapters/UnicacheApc.php');
                    if (!UNICACHE_APCCache::isSupported())
                    {
                        //throw new RunTimeException('UNICACHE: Cache "'.$backend.'" is NOT supported!');
                    }
                    else
                    {
                        $cache = new UNICACHE_APCCache();
                    }
                    break;
                case 'APCU':
                    if (!class_exists('UNICACHE_APCUCache', false))
                        require_once(dirname(__FILE__) . '/adapters/UnicacheApcu.php');
                    if (!UNICACHE_APCUCache::isSupported())
                    {
                        //throw new RunTimeException('UNICACHE: Cache "'.$backend.'" is NOT supported!');
                    }
                    else
                    {
                        $cache = new UNICACHE_APCUCache();
                    }
                    break;
                case 'XCACHE':
                    if (!class_exists('UNICACHE_XCache', false))
                        require_once(dirname(__FILE__) . '/adapters/UnicacheXCache.php');
                    if (!UNICACHE_XCache::isSupported())
                    {
                        //throw new RunTimeException('UNICACHE: Cache "'.$backend.'" is NOT supported!');
                    }
                    else
                    {
                        $cache = new UNICACHE_XCache();
                    }
                    break;
                case 'MEMCACHED':
                    if (!class_exists('UNICACHE_MemcachedCache', false))
                        require_once(dirname(__FILE__) . '/adapters/UnicacheMemcached.php');
                    if (!UNICACHE_MemcachedCache::isSupported())
                    {
                        //throw new RunTimeException('UNICACHE: Cache "'.$backend.'" is NOT supported!');
                    }
                    else
                    {
                        $cache = new UNICACHE_MemcachedCache();
                        foreach ((array)$config['MEMCACHED']['servers'] as $srv)
                        {
                            $cache->addServer($srv['host'], $srv['port'], $srv['weight']);
                        }
                    }
                    break;
                case 'REDIS':
                    if (!class_exists('UNICACHE_RedisCache', false))
                        require_once(dirname(__FILE__) . '/adapters/UnicacheRedis.php');
                    if (!UNICACHE_RedisCache::isSupported())
                    {
                        //throw new RunTimeException('UNICACHE: Cache "'.$backend.'" is NOT supported!');
                    }
                    else
                    {
                        $cache = new UNICACHE_RedisCache();
                        $cache->server($config['REDIS']['server']['host'], $config['REDIS']['server']['port']);
                    }
                    break;
                case 'MEMORY':
                    if (!class_exists('UNICACHE_MemoryCache', false))
                        require_once(dirname(__FILE__) . '/adapters/UnicacheMemory.php');
                    if (!UNICACHE_MemoryCache::isSupported())
                    {
                        //throw new RunTimeException('UNICACHE: Cache "MEMORY" is NOT supported!');
                    }
                    else
                    {
                        $cache = new UNICACHE_MemoryCache();
                    }
                    break;
            }

            if ($cache)
            {
                $cache->setPrefix(isset($config['prefix']) ? $config['prefix'] : '');
                return $cache;
            }
        }
        return null;
    }
}
}
