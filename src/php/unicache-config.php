<?php

$unicache_config = array(
    'ttl'       => 60, // one minute cache time to live
    'cacheType' => 'FILE', // file based cache
    'FILE'      => array(
                    'cacheDir'=>dirname(__FILE__).'/cache' // the cache directory
                ),
    'MEMCACHED' => array(
                    'servers'=>array(
                        array('host'=>'localhost','port'=>11211,'weight'=>10) // memcached servers
                    )
                ),
    'REDIS' => array(
                    'server'=>array('host'=>'127.0.0.1','port'=>6379) // redis server
                ),
    'filter_func' => 'my_filter', // user defined post cache filter function
    'cache_func'  => 'my_cache' // user defined function to disable caching
);

// filter content after caching
function my_filter($content)
{
    return $content . '<br />FILE ' . date('y/m/d, H:i:s', time());
}
// disable caching under certain conditions
function my_cache()
{
    return isset($_GET['foo']) ? false : true;
}
