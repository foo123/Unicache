<?php

class UNICACHE_MemcachedCache extends UNICACHE_Cache
{
    public static function isSupported( )
    {
        return (extension_loaded('memcached') || extension_loaded('memcache'));
        //return class_exists('Memcached', false) || class_exists('Memcache', false);
    }
    
    // Memcache object
    private $connection;

    public function __construct()
    {
        $this->connection = null;
        if (class_exists('Memcached', false))
        {
            $this->connection = new \Memcached();
        }
        elseif (class_exists('Memcache', false))
        {
            $this->connection = new \Memcache();
        }
    }

    public function put( $key, $data, $ttl )
    {
        if (get_class($this->connection) === 'Memcached')
        {
            return $this->connection->set($key, $value, $ttl);
        }
        elseif (get_class($this->connection) === 'Memcache')
        {
            return $this->connection->set($key, $value, 0, $ttl);
        }
        return false;
    }

    public function get( $key )
    {
        return $this->connection->get( $key );
    }

    public function remove( $key )
    {
        return $this->connection->delete( $key );
    }

    public function clear( )
    {
        return $this->connection->flush( );
    }

    public function addServer( $host, $port=11211, $weight=10 )
    {
        if (get_class($this->connection) === 'Memcache')
        {
            $this->connection->addServer( $host, $port, true, $weight );
        }
        else
        {
            $this->connection->addServer( $host, $port, $weight );
        }
        return $this;
    }
} 
