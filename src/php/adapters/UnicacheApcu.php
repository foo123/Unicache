<?php

class UNICACHE_APCUCache extends UNICACHE_Cache
{
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
}
