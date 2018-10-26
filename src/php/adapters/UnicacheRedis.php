<?php
require_once(dirname(__FILE__).'/drivers/redis.php');

class UNICACHE_RedisCache extends UNICACHE_Cache
{
    public static function isSupported( )
    {
        //return extension_loaded('redis');
        return true;
    }
    
    // Lightweight Redis client
    private $redis;

    public function put( $key, $data, $ttl )
    {
        $data = serialize(array(time()+(int)$ttl, $data));
        return $this->redis->cmd('SET', $key, $data)->cmd('EXPIRE', $key, (int)$ttl)->set();
    }

    public function get( $key )
    {
        $data = $this->redis->cmd('GET', $key)->get();
        if ( !$data ) return false;
        $data = @unserialize($data);
        if ( !$data ) return false;
        if ( time() > $data[0] )
        {
            $this->redis->cmd('DEL', $key)->set();
            return false;
        }
        return $data[1];
    }

    public function remove( $key )
    {
        return $this->redis->cmd('DEL', $key)->set();
    }

    public function clear( )
    {
        $keys = $this->redis->cmd('KEYS', '*')->get();
        if ( !$keys ) return true;
        foreach($keys as $key)
        {
            $this->redis->cmd('DEL', $key);
        }
        $this->redis->set();
        return true;
    }

    public function server( $host, $port=6379 )
    {
        $this->redis = new redis_cli( $host, $port );
        return $this;
    }
} 
