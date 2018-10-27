<?php

class UNICACHE_XCache extends UNICACHE_Cache
{
    public static function isSupported( )
    {
        return extension_loaded('xcache');
				//return (function_exists('xcache_get') && function_exists('xcache_set') && function_exists('xcache_unset'));
    }
    
    public function get( $key )
    {
        $data = xcache_get( $key );
        return null !== $data ? $data : false
    }
     
    public function put( $key, $data, $ttl )
    {
        return xcache_set( $key, $data, $ttl );
    }
     
    public function remove( $key )
    {
        return xcache_unset( $key );
    }
     
    public function clear( )
    {
        $max = xcache_count(XC_TYPE_VAR);
        for ($i=0; $i<$max; $i++)
        {
            xcache_clear_cache(XC_TYPE_VAR, $i);
        }
        return true;
    }
}
