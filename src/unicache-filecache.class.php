<?php
require_once 'unicache-cache.class.php';

class UNICACHE_FileCache extends UNICACHE_Cache
{
 
	private $cachedir='';
	
	public function UNICACHE_FileCache()
	{
		//$this->cachedir=dirname(__FILE__).DIRECTORY_SEPARATOR.'cache';
		//clearstatcache();
		//if (!(file_exists($this->cachedir)  && is_dir($this->cachedir)))
			//@mkdir($this->cachedir);
	}
	
	public function put($key,$data,$ttl) {

		// Opening the file in read/write mode
		$ch = fopen($this->getFileName($key),'a+');
		if (!$ch) throw new Exception('UNICACHE: Could not save to cache');

		flock($ch,LOCK_EX); // exclusive lock, will get released when the file is closed
		fseek($ch,0); // go to the start of the file
		// truncate the file
		ftruncate($ch,0);

		// Serializing along with the TTL
		$data = serialize(array(time()+$ttl,$data));
		if (fwrite($ch,$data)===false) {
			throw new Exception('UNICACHE: Could not save to cache');
		}
		fclose($ch);

	}
 
	public function get($key) {
	 
		$filename = $this->getFileName($key);
		if (!file_exists($filename)) return false;
		$ch = fopen($filename,'r');
		 
		if (!$ch) return false;
		 
		// Getting a shared lock
		flock($ch,LOCK_SH);
		 
		$data = file_get_contents($filename);
		fclose($ch);
		 
		$data = @unserialize($data);
		if (!$data) {
		unlink($filename);
		return false;
		}
 
		if (time() > $data[0]) {
		 
			// Unlinking when the file was expired
			unlink($filename);
			return false;
	 
		}
		return $data[1];
	}
 
	public function remove( $key ) {
	 
		$filename = $this->getFileName($key);
		if (file_exists($filename)) {
		return unlink($filename);
		} else {
		return false;
		}
	 
	}
	 
	public function setCacheDir($dir)
	{
		$this->cachedir=$dir;
		if (!(file_exists($this->cachedir)  && is_dir($this->cachedir)))
			@mkdir($this->cachedir);
	}
	
	protected function getFileName($key) {
	 
		return $this->cachedir .DIRECTORY_SEPARATOR. md5($key);
	 
	}
} 
?>