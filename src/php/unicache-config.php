<?php

$unicache_config=array(
	'ttl'		=>	60, // one minute cache time to live
	'cacheType'	=>	'FILE', // file based cache
	'FILE'		=> 	array(
						'cacheDir'=>'c:\xampp\htdocs\unicache\cache' // the cache directory
					),
	'MEMCACHED'		=> 	array(
						'servers'=>array(
							array('host'=>'localhost','port'=>11211,'weight'=>10) // memcached servers
						)
					),
	'filter_func'=>'my_filter', // user defined post cache filter function
	'cache_func'=>'my_cache' // user defined function to disable caching
);

// require the cache classes
require_once('unicache-factory.class.php');

// filter content after caching
function my_filter($content)
{
	return $content.'<br />FILE '.date('y/m/d, H:i:s', time());
}
// disable caching under certain conditions
function my_cache()
{
	if (isset($_GET['foo']))
		return false;
	return true;
}
?>