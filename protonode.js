
(function( Protonode ){
     if (typeof define == 'function' && typeof define.amd == 'object' && define.amd)
         define( 'protonode', ['lodash'], Protonode);
     else if( typeof module !== 'undefined' && module.exports )
         module.exports = Protonode( require('lodash') )
     else
         window.Protonode = Protonode( _ );
})( function( _ ){
    'use strict';
    
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

        Object.defineProperty(this, "type", {
            value: options && options.type || this.constructor.type
        ,   writeable: false
        ,   enumerable: true
        })

        this.__id = _.uniqueId(this.type)

        adopt(this, parent)

        this.initialize( 
            _.omit(options, ['__id', '__children', 'children', '__parent', 'parent'])
        )
        
    }

    /**
     * Creates relationship between node and parent
     * @param  {<Node>} parent the parent node receiving the child
     * @param  {<Node>} child  the node to associate to the parent
     * @return {<Node>}        the child node
     */
    function adopt(child, parent){
        // TODO TEST remove child from former parent if any
        // if( child.__parent && child.__parent()) 
        //     child.__parent().children().remove(child)
        /**
         * Avoid cyclical structures
         * @return {Node}
         */
        child.__parent   = _.constant(parent)
        child.__children = []

        return child;
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
        /**
         * A where function adapted to accept a string which matches on type
         * @param  {[<Node>]} collection a collection of nodes
         * @param  {String|Object} condition  a string searching on type or an 
         *                                    object to pass to .where
         * @return {[<Node>]}            a filter array of nodes
         */
    ,   where: function(collection, condition){
            if(!_.isEmpty(condition) && !_.isEmpty(condition))
                if(_.isString(condition))
                    condition = {type:condition}
                if(_.isObject(condition))
                    collection = collection.where(condition)
            return collection;
        }
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
    ,   children: function(condition){
            return Node.where(_(this.__children), condition);
        }

        /**
         * Returns current node and it's siblings
         * @return {[<Node>]}
         */
    ,   siblings: function(condition){
            return this.parent() && this.parent().children(condition) 
                || Node.where(_([this]), condition);
        }

        /**
         * Returns ancestor of type
         * @param  {String} type
         * @return {<Node>}
         */
    ,   ancestor: function( type ){
            var ancestor, parent = ancestor = this.parent();

            while( type !== void 0 && parent !== void 0 && parent.getType() !== type 
                || type === void 0 && parent !== void 0){
                parent = parent.parent()
                parent && ( ancestor = parent )

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
            if( _.isObject(type) || _.isFunction(type) ){
                if( type === void 0 ) return this.children()
                var descendants = _([this])
                ,   nodes = _([]);
                while( descendants.size() && descendants.first() ){
                    descendants = descendants.reduce(function(child, sibling){
                        return child.concat( sibling.children().value() )
                    }, _([]) )
                    nodes = nodes.concat(descendants.where(type).value())
                }
                return nodes;
            }
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
            var index = this.indexOf(this);
            return index > 0 && this.siblings().at(index-1).first()
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
            var index = this.indexOf(this);
            return index < this.siblings().size() && this.siblings().at(index+1).first()
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
         * Take on child and set child's parent to this
         * @param  {<Node>} node a protonode
         * @return {<Node>}      the parent node
         */
    ,   adopt: function( node ){
            if( node instanceof Protonode ){
                adopt(node, this)
                this.__children.push(node)
                return this
            }
            return false
        }

        /**
         * Constructs a child of this <NodeType> with the given properties
         * @param {Object|<Node>} node properties
         * @return {<Node>} returns new node
         */
    ,   add: function( node, options ){
            if( _.isObject(node) ){
                var constructor = node instanceof Protonode? node.constructor
                    :   this.constructor.child || this.constructor
                this.__children.push(
                    (   node.index = this.__children.length
                    ,   node = new  (constructor)( node, this )   )
                )
            }
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