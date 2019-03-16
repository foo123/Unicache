<?php

require_once(dirname(dirname(__FILE__)).'/src/php/Unicache.php');

echo 'UNICACHE::VERSION = ' . UNICACHE_Factory::VERSION . PHP_EOL;

$config = array(
    'cacheType' => 'FILE',
    'prefix' => 'foo_',
    
    'FILE' => array(
        'cacheDir' => dirname(__FILE__).'/cache1' // will be created if it does not exist
    )
);


$cache = UNICACHE_Factory::getCache($config);

$cache->put('key', 'val', 10);

sleep(2);

$val = $cache->get('key');

print_r(array('val',$val));

sleep(12);

$val = $cache->get('key');

print_r(array('val',$val));