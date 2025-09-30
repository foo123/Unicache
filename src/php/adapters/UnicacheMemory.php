<?php
class UNICACHE_MemoryCache extends UNICACHE_Cache
{
    public static function isSupported()
    {
        return true;
    }

    protected $cache;

    public function __construct()
    {
        $this->cache = array();
    }

    public function __destruct()
    {
        $this->cache = null;
    }

    public function get($key)
    {
        $key = $this->prefix . $key;
        if (!isset($this->cache[$key])) return false;

        $data = $this->cache[$key];

        if (!$data || (time() > $data[0]))
        {
            unset($this->cache[$key]);
            return false;
        }
        return $data[1];
    }

    public function put($key, $data, $ttl)
    {
        $this->cache[$this->prefix . $key] = array(time() + (int)$ttl, $data);
    }

    public function remove($key)
    {
        $key = $this->prefix . $key;
        if (!isset($this->cache[$key])) return false;
        unset($this->cache[$key]);
        return true;
    }

    public function clear()
    {
        if (!strlen($this->prefix))
        {
            $this->cache = array();
        }
        else
        {
            foreach ($this->cache as $key => $data)
            {
                if (0 === strpos($key, $this->prefix, 0))
                {
                    unset($this->cache[$key]);
                }
            }
        }
        return true;
    }

    public function gc($maxlifetime)
    {
        $maxlifetime = (int)$maxlifetime;
        $currenttime = time();
        $l = strlen($this->prefix);
        foreach ($this->cache as $key => $data)
        {
            if (!$l || (0 === strpos($key, $this->prefix, 0)))
            {
                if ($data[0] < $currenttime-$maxlifetime )
                    unset($this->cache[$key]);
            }
        }
        return true;
    }
}
