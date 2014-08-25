<?php
abstract class UNICACHE_Cache
{
abstract function get($key);
abstract function put($key,$data,$ttl);
abstract function remove($key);
}
?>