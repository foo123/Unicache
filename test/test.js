
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

cache.put('key', 'val', 10, function(err, result){
    if ( err ) throw err;
    setTimeout(function(){
        cache.get('key', function(err, val){
            if ( err ) throw err;
            console.log(['val', val]);
        });
    }, 2000);
});
