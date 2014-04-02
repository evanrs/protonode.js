(function( Protonode ){
     if (typeof define == 'function' && typeof define.amd == 'object' && define.amd)
         define( 'protonode', ['lodash'], Protonode);
     else if( typeof module !== 'undefined' && module.exports )
         module.exports = Protonode( require('lodash') )
     else
         window.Protonode = Protonode( _ );
})( function( _ ){
    
    /**
     * Node constructor
     * @param {Object} options
     * @param {<Node>|undefined} parent
     */
    function Node(options, parent){
        // enforces new
        if (!(this instanceof this.constructor)){
            return new (this.constructor)(args);
        }
        
        /**
         * Avoid cyclical structures
         * @return {Node}
         */
        this.__parent   = _.constant(parent)
        this.__children = []

        Object.defineProperty(this, "type", {
            value: options && options.type || this.constructor.type
        ,   writeable: false
        ,   enumerable: true
        })

        this.__id = _.uniqueId(this.type)

        this.initialize( 
            _.omit(options, ['__id', '__children', 'children', '__parent', 'parent'])
        )
    }

    /**
     * Static properties and methods
     */
    _.assign( Node, {
        /**
         * The constructor of the childs node type
         * @type {<Node>.constructor}
         */
        child: void 0
        /**
         * The lexical type of the node
         * @type {String}
         */
    ,   type: 'node'
    })

    /**
     * Instance properities and methods
     */
    _.assign( Node.prototype, {
        /**
         * Parent reference, void by default
         * Wrapped to avoid cyclical JSON
         * @type {<Node>|undefined}
         */
        __parent: void 0

        /**
         * Array of children
         * @type {Array}
         */
    ,   __children: void 0

        /**
         * Initializes node and sets parent
         * @param  {Object} options
         * @param  {<Node>|undefined} parent
         * @return {<Node>}
         */
    ,   initialize: function(options){
            _.assign(this, options);
        }

        /**
         * Returns the node type
         * @return {String}
         */
    ,   getType: function(){ 
            return this.type || this.constructor.type 
        }

        /**
         * Returns parent of node
         * @return {[<Node>]}
         */
    ,   parent: function(){
            return this.__parent();
        }

        /**
         * Returns children of node
         * @return {[<Node>]}
         */
    ,   children: function(){
            return _(this.__children);
        }

        /**
         * Returns current node and it's siblings
         * @return {[<Node>]}
         */
    ,   siblings: function(){
            return this.parent() && this.parent().children() || _([this]);
        }

        /**
         * Returns ancestor of type
         * @param  {String} type
         * @return {<Node>}
         */
    ,   ancestor: function( type ){
            var ancestor = this.parent()

            while( type !== void 0 && ancestor !== void 0 && ancestor.getType() !== type 
                || type === void 0 && ancestor !== void 0){
                ancestor.parent() && ( ancestor = ancestor.parent() )
            }
            return ancestor
        }

        /**
         * Returns ancestor of type and it's siblings
         * @param  {String} type
         * @return {[<Node>]}
         */
    ,   ancestors: function( type ){
            var ancestor = this.ancestor(type);
            return ancestor && ancestor.siblings();
        }

        /**
         * Returns first matching descendant and siblings
         * @param  {[type]} type
         * @return {[type]}
         */
    ,   descendants: function( type ){
            var descendants = this.children();
            while( type !== void 0 && descendants.size() && descendants.first() && !descendants.find({type:type}) ){
                descendants = descendants.reduce(function(child, sibling){
                    return child.concat( sibling.children().value() )
                }, _([]) )
            }
            return descendants
        }

        /**
         * Returns the index of the current node relative to it's siblings
         * @return {int} index
         */
    ,   indexOf: function(){
            return this.siblings().indexOf(this)
        }

        /**
         * Returns the sibling at the previous index
         * - if sibling null? returns parent
         * - if parent is null? return this
         * @return {[<Node>]}
         */
    ,   prev: function(){
            return this.index > 0 && this.siblings().at(this.index-1).first()
                || this.parent() && this.parent()  // navigating back returns you to your parent
                || this                            // must be at root
        }

        /**
         * Returns the sibling at the next index
         * - if sibling null? returns parents next sibling
         * - if parent is null? return this
         * @return {Function}
         */
    ,   next: function(){
            return this.index < this.siblings().size() && this.siblings().at(this.index+1).first()
                || this.parent() && this.parent().next() //navigating forward returns your parents next sibling
                || this
        }
        /**
         * Compares provided string to node type
         * @param  {String}  type 
         * @return {Boolean}      
         */
    ,   is: function( type ){
            return this.type === type;
        }
        /**
         * Constructs a child of this <NodeType> with the given properties
         * @param {Object|<Node>} node properties
         * @return {<Node>} returns new node
         */
    ,   add: function( node, options ){
            if( _.isObject(node) )
                this.__children.push(
                    (   node.index = this.__children.length
                    ,   node = new  (this.constructor.child || this.constructor)( node, this )   )
                )
            else throw new Error("Node.add received an invalid value");
            return node;
        }
        /**
         * Returns the enumerable properties of the node
         * @param  {Array}  blacklist certain properties form output
         * @return {Object} JSON
         */
    ,   toJSON: function( blacklist ){
            var clone = _.clone(this);
            this.__children && ( clone.children = clone.__children )
            return _.omit( clone, ['__children', '__parent'].concat( blacklist ) );
        }
    })

    /**
     * Support for easy inheritance and subtyping
     * As originally seen in Backbone.js
     * @type {Function}
     */
    Node.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

    return Node;
})