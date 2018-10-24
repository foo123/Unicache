<?php

class UNICACHE_MemcachedCache extends UNICACHE_Cache
{
 
    // Memcache object
    private $connection;

    public function __construct()
    {
        $this->connection = new MemCache( );
    }

    public function put( $key, $data, $ttl )
    {
        return $this->connection->set( $key, $data, 0, $ttl);
    }

    public function get( $key )
    {
        return $this->connection->get( $key );
    }

    public function remove( $key )
    {
        return $this->connection->delete( $key );
    }

    public function addServer( $host, $port=11211, $weight=10 )
    {
        $this->connection->addServer( $host, $port, true, $weight );
        return $this;
    }

} 
