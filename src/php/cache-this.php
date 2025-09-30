<?php
// include the unicache configuration
require_once(dirname(__FILE__) . '/unicache-config.php');
require_once(dirname(__FILE__) . '/Unicache.php');

// user defined function to check per page caching
$unicache_docache = true;
if (isset($unicache_config['cache_func']) && is_callable($unicache_config['cache_func']))
{
    $unicache_docache = call_user_func($unicache_config['cache_func']);
}

// if caching is enabled
if ($unicache_docache)
{
    $cache = UNICACHE_Factory::getCache($unicache_config);

    $key = $_SERVER['REQUEST_URI'];
    $ttl = (int)$unicache_config['ttl'];

    // shutdown function to output and cache
    function UNICACHE_cacheOutput()
    {
        global $cache, $key, $ttl, $unicache_config;

        $webpage = ob_get_contents();

        // post cache user defined filter function
        if (isset($unicache_config['filter_func']) && is_callable($unicache_config['filter_func']))
        {
            $webpage = call_user_func($unicache_config['filter_func'], $webpage);
        }
        // cache page
        $cache->put($key, $webpage, $ttl);

        ob_end_clean();
        // show it first time
        echo $webpage;
    }

    // Is cache data still fresh? If so, serve it.
    $data = $cache->get($key);
    if ($data != false)
    {
        echo $data;
        exit(0);
    }
    // start caching
    ob_start();
    ob_implicit_flush(false);
    register_shutdown_function("UNICACHE_cacheOutput");
}
