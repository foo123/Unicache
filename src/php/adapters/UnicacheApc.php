<?php

class UNICACHE_APCCache extends UNICACHE_Cache
{
    public function get( $key )
    {
        return apc_fetch( $key );
    }
     
    public function put( $key, $data, $ttl )
    {
     
        return apc_store( $key, $data, $ttl );
    }
     
    public function remove( $key )
    {
        return apc_delete( $key );
    }
}
