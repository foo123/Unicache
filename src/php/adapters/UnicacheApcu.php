<?php

class UNICACHE_APCUCache extends UNICACHE_Cache
{
    public static function isSupported( )
    {
        return (function_exists('apcu_fetch') && function_exists('apcu_store') && function_exists('apcu_delete'));
    }
    
    public function get( $key )
    {
        $data = apcu_fetch( $key, $success );
        return $success ? $data : false
    }
     
    public function put( $key, $data, $ttl )
    {
        return apcu_store( $key, $data, $ttl );
    }
     
    public function remove( $key )
    {
        return apcu_delete( $key );
    }
     
    public function clear( )
    {
        if (class_exists('APCuIterator', false))
        {
            // http://php.net/manual/en/apcuiterator.construct.php
            apcu_delete(new APCuIterator(null, APC_ITER_NONE));
            return true;
        }

        $cache = @apcu_cache_info(); // Raises warning by itself already
        foreach ($cache['cache_list'] as $key)
        {
            apcu_delete($key['info']);
        }
        return true;
    }
}
