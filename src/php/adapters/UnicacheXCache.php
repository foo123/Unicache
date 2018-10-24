<?php

class UNICACHE_XCache extends UNICACHE_Cache
{
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
}
