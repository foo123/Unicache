<?php
// include the unicache configuration
require_once('unicache-config.php');

// user defined function to check per page caching
$unicache_docache=true;
if (function_exists($unicache_config['cache_func']))
{
	$unicache_docache=call_user_func($unicache_config['cache_func']);
}

// if caching is enabled
if ($unicache_docache)
{   
	$cache=UNICACHE_Factory::getCache();

	$key=$_SERVER['REQUEST_URI'];
	$ttl=$unicache_config['ttl'];

	// shutdown function to output and cache
	function UNICACHE_cacheOutput()
	{
		global $cache,$key,$ttl,$unicache_config;
		
		$webpage = ob_get_contents();
		
		// post cache user defined filter function
		if (function_exists($unicache_config['filter_func']))
		{
			$webpage=call_user_func($unicache_config['filter_func'], $webpage);
		}
		// cache page
		$cache->put($key,$webpage,$ttl);
		
		ob_end_clean();
		// show it first time
		echo $webpage;
	}

	// Is cache data still fresh? If so, serve it.   
	$data=$cache->get($key);
	if ($data!=false) {
		echo $data;
		exit(0);
	}
	// start caching
	ob_start();
	ob_implicit_flush(false);
	register_shutdown_function("UNICACHE_cacheOutput");
}
?>