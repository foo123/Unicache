"use strict";

module.exports = function( UNICACHE ) {
    var PROTO = 'prototype', _ = UNICACHE._, fs = require('fs');

    var FileCache = UNICACHE.FileCache = function( ) { };

    // extend UNICACHE.Cache class
    FileCache[PROTO] = Object.create(UNICACHE.Cache[PROTO]);

    FileCache.isSupported = function( ) {
        return true;
    };

    FileCache[PROTO].encoding = 'utf8';
    FileCache[PROTO].cachedir = '';

    FileCache[PROTO].supportsSync = function( ) {
        // can read/write/etc using sync operations as well
        return true;
    };

    FileCache[PROTO].put = function( key, data, ttl, cb ) {
        // write sync or async here
        ttl = +ttl;
        if ('function' === typeof cb )
        {
            fs.writeFile(this.getFileName(key), _.serialize([_.time()+ttl,data]), {encoding:this.encoding}, function(err){
                cb(err, err ? false : true);
            });
        }
        else
        {
            fs.writeFileSync(this.getFileName(key), _.serialize([_.time()+ttl,data]), {encoding:this.encoding});
        }
    };

    FileCache[PROTO].get = function( key, cb ) {
        // read sync or async here
        var file = this.getFileName(key);

        if ( 'function' === typeof cb )
        {
            fs.readFile(file, {encoding:this.encoding}, function(err, data){
                if ( err || !data )
                {
                    cb(err, false);
                }
                else
                {
                    data = _.unserialize(''+data);

                    if (!data || _.time() > data[0])
                    {
                        // Unlinking when the file was expired
                        fs.unlink(file, function(err){});
                        cb(null, false);
                    }
                    else
                    {
                        cb(null, data[1]);
                    }
                }
            });
        }
        else
        {
            var data = _.unserialize(''+fs.readFileSync(file, {encoding:this.encoding}));

            if ( !data || _.time() > data[0] )
            {
                // Unlinking when the file was expired
                // use async here as we do not need to wait, whenever it finishes it is fine
                fs.unlink(file, function(err){});
                return false;
            }
            return data[1];
        }
    };

    FileCache[PROTO].remove = function( key, cb ) {
        // remove sync or async here
        var filename = this.getFileName(key);
        if ( 'function' === typeof cb )
        {
            fs.unlink(filename, function(err){
                cb(err, err ? false : true);
            });
        }
        else
        {
            fs.unlinkSync(filename);
            return true;
        }
    };

    FileCache[PROTO].clear = function( cb ) {
        // clear sync or async here
        if ( 'function' === typeof cb )
        {
            var self = this;
            fs.readdir(this.cachedir, function(err, files){
                if ( err || !files || !files.length )
                {
                    // return true with a small delay to finish all files
                    setTimeout(function(){cb(err, err ? false : true);}, 10);
                    return;
                }
                var pl = self.prefix.length, filename, file, i, l;
                for(i=0,l=files.length; i<l; i++)
                {
                    filename = files[i];
                    if ( pl && 0!==filename.indexOf(self.prefix) ) continue;
                    file = self.cachedir + '/' + filename;
                    fs.lstat(file, (function(file){
                        // closure
                        return function( err, stat ){
                            if ( !err && stat.isFile() )
                            {
                                // delete
                                fs.unlink(file, function(err){});
                            }
                        };
                    })(file));
                }
                // return true with a small delay to finish all files
                setTimeout(function(){cb(null, true);}, 10);
            });
        }
        else
        {
            var files = fs.readdirSync(this.cachedir), pl = this.prefix.length,
                file, filename, i, l, stat;
            if ( !files || !files.length ) return true;
            for(i=0,l=files.length; i<l; i++)
            {
                filename = files[i];
                if ( pl && 0!==filename.indexOf(this.prefix) ) continue;
                file = this.cachedir + '/' + filename;
                stat = fs.lstatSync(file);
                if ( stat && stat.isFile() )
                {
                    // expired, delete
                    fs.unlinkSync(file);
                }
            }
            return true;
        }
    };

    FileCache[PROTO].gc = function( maxlifetime, cb ) {
        // use async here by default as we do not need to wait, whenever it finishes it is fine
        maxlifetime = +maxlifetime;
        var self = this, currenttime = _.time();;
        fs.readdir(this.cachedir, function(err, files){
            if ( err || !files || !files.length ) return;
            var pl = self.prefix.length, filename, file, i, l;
            for(i=0,l=files.length; i<l; i++)
            {
                filename = files[i];
                if ( pl && 0!==filename.indexOf(self.prefix) ) continue;
                file = self.cachedir + '/' + filename;
                fs.lstat(file, (function(file){
                    // closure
                    return function( err, stat ){
                        if ( !err && stat.isFile() ) {
                            var mtime = stat.mtime;
                            if ( !mtime ) return;
                            if ( mtime+maxlifetime < currenttime )
                            {
                                // expired, delete
                                fs.unlink(file, function(err){});
                            }
                        }
                    };
                })(file));
            }
        });
        if ( 'function' === typeof cb )
        {
            // return true with a small delay to finish all files
            setTimeout(function(){cb(null, true);}, 100);
        }
        else
        {
            return true;
        }
    };

    FileCache[PROTO].setEncoding = function( encoding ) {
        this.encoding = !!encoding ? (''+encoding) : 'utf8';
        return this;
    };

    FileCache[PROTO].setCacheDir = function( dir ) {
        // use sync here by default as it is needed immediately on initialization
        this.cachedir = _.rtrim(dir, '/\\');
        if ( !fs.existsSync(this.cachedir) )
            fs.mkdirSync(this.cachedir, {recursive:true, mode:parseInt('0755', 8)}); // recursive
        return this;
    };

    FileCache[PROTO].getFileName = function( key ) {
        return this.cachedir + '/' + this.prefix + _.md5(key);
    };

    return FileCache;
};
