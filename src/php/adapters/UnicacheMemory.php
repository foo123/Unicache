<?php

class UNICACHE_MemoryCache extends UNICACHE_Cache
{
    public static function isSupported( )
    {
        return true;
    }
    
    private $_cache;

    public function __construct()
    {
        $this->_cache = array();
    }

    public function __destruct()
    {
        $this->_cache = null;
    }

    public function put( $key, $data, $ttl )
    {
        $this->_cache[$this->prefix.$key] = array(time()+(int)$ttl,$data);
    }

    public function get( $key )
    {
        if ( !isset($this->_cache[$this->prefix.$key]) ) return false;
        
        $data = $this->_cache[$this->prefix.$key];
        if ( !$data ) return false;

        if ( time() > $data[0] ) return false;
        return $data[1];
    }

    public function remove( $key )
    {
        if ( !isset($this->_cache[$this->prefix.$key]) ) return false;
        unset($this->_cache[$this->prefix.$key]);
        return true;
    }

    public function clear( )
    {
        $this->_cache = array();
        return true;
    }
} 
