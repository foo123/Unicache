<?php
// cache factory class (Factory Design Pattern)
class UNICACHE_Factory
{
 
	public static function getCache()
	{
		global $unicache_config;
		$uniconf=$unicache_config;
		
		$backend=$uniconf['cacheType'];
		$cache=null;
		switch($backend)
		{
		case 'FILE': 
					require_once 'unicache-filecache.class.php';
					$cache=new UNICACHE_FileCache();
					$cache->setCacheDir($uniconf['FILE']['cacheDir']);
					break;
		case 'APC': 
					require_once 'unicache-apccache.class.php';
					$cache=new UNICACHE_APCCache();
					break;
		case 'MEMCACHED': 
					require_once 'unicache-memcachedcache.class.php';
					$cache=new UNICACHE_MemcachedCache();
					foreach ($uniconf['MEMCACHED']['servers'] as $srv)
					{
						$cache->addServer($srv['host'],$srv['port'],$srv['weight']);
					}
					break;
		}
		return ($cache);
	}
}
?>