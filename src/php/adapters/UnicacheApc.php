<?php

class UNICACHE_APCCache extends UNICACHE_Cache
{
    public static function isSupported( )
    {
        return (function_exists('apc_fetch') && function_exists('apc_store') && function_exists('apc_delete'));
    }
    
    public function __construct()
    {
    }
    
    public function __destruct()
    {
    }
    
    public function get( $key )
    {
        return apc_fetch( $this->prefix.$key );
    }
     
    public function put( $key, $data, $ttl )
    {
        return apc_store( $this->prefix.$key, $data, $ttl );
    }
     
    public function remove( $key )
    {
        return apc_delete( $this->prefix.$key );
    }
     
    public function clear( )
    {
        return false;
    }
}
