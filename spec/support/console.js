/**
 * Pretty print our console logs.
 * @param  {console.log function} log
 * @return {console.log stub}
 */
console.log = (function(log){
    return function(){
        var args = [].slice.call(arguments)
        _.each(args, function(v,k){
            if(_.isObject(v)){
                args[k] =  "\n" + JSON.stringify( v, null, 4 ) + "\n";
            }
        })
        log.apply(console, args);
    }
})(console.log);