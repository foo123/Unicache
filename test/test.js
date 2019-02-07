
var UNICACHE = require(__dirname+'/../src/js/Unicache.js');

console.log('UNICACHE.VERSION = ' + UNICACHE.Factory.VERSION);

var config = {
    'cacheType' : 'FILE',
    'prefix' : 'foo_',
    
    'FILE' : {
        'cacheDir' : __dirname+'/cache2' // will be created if it does not exist
    }
};


var cache = UNICACHE.Factory.getCache(config);

cache.put('key', 'val', 10, function(res){
    cache.get('key', function(val){
        console.log(['val', val]);
    });
});
