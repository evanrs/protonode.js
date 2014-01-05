describe('Protonode', function(){

    var node
    ,   BiologicalClassification
    ,   Life, Kingdom, Phylum, Class, Order, Family, Genus, Species;

    it("should exist", function(){
        expect( Protonode ).not.to.equal( void 0 );

        node = new Protonode({ type:'node' });
        expect( node ).to.have.property('type')
            .that.equals('node')

    })

    describe("Children", function(){
        var family, parent, uncle, child, sibling, cousin, grand, grand_sibling, grand_cousin, great;

        it("should take children", function(){
            expect( family ).to.be.an.instanceof(Protonode)

            expect( family.add ).to.throw(Error);
            expect( function(){
                child = family.add({ type: 'child' })
                sibling = family.add( child )
            }).not.to.throw()
            
            expect( family.children().value() ).to.have.length( 2 )

            expect( new Protonode().children().size() ).to.equal( 0 )
        })

        describe('Lineage', function(){

            describe("Descendants", function(){

                it("should return descendants by type", function(){
                    expect( family.descendants('parent').size() ).to.equal(2)
                    expect( family.descendants('child').size()  ).to.equal(3)
                    expect( family.descendants('grand').size()  ).to.equal(3)
                    expect( family.descendants('great').size()  ).to.equal(1)

                    expect( child.descendants().size() ).to.equal(2);
                    expect( grand.descendants().size() ).to.equal(1);
                    expect( great.descendants().size() ).to.equal(0);

                    expect( uncle.descendants().size() ).to.equal(1);
                    expect( cousin.descendants().size() ).to.equal(0);
                    
                })

                it("should return children when untyped", function(){
                    // A untyped call to descendants will return its immediate children
                    expect( family.descendants().size() ).to.equal(2);
                    expect( family.descendants().value() ).to.equal( family.children().value() )
                    expect( family.descendants().first() ).to.have.property('type').that.equals('parent')
                })

            })

            describe("Ancestor", function(){
                it("should return an ancestor by type", function(){
                    expect( family.ancestor('anyValue') ).to.be.undefined
                    expect( parent.ancestor('family') ).to.equal( family )
                    expect( child.ancestor('family') ).to.equal( family );
                    expect( grand.ancestor('parent') ).to.equal( parent );
                    expect( great.ancestor('child') ).to.equal( child );
                })
                it("should return it's parent when undefined", function(){

                    expect( family.parent() ).to.be.undefined;
                    expect( parent.parent() ).to.equal( family )
                    expect( child.parent() ).to.equal( parent )

                    expect( family.ancestor() ).to.be.undefined
                    expect( parent.ancestor() ).to.equal( family )
                    expect( child.ancestor() ).to.equal( parent )
                })

            })
            describe('Ancestors', function(){
                it("should return all siblings of the closest ancestor of the type", function(){
                    // family's ancestors should be undefined, they have a poor memory
                    expect( family.ancestors('anyValue') ).to.be.undefined
                    // parents ancestors should be family
                    expect( parent.ancestors('family').first() ).to.equal( family );
                    // child's ancestor should match cousins ancestors
                    expect( child.ancestors('parent').value() ).to.equal( cousin.ancestors('parent').value() );

                    expect( cousin.ancestors('parent').size() ).to.equal( 2 );
                    expect( great.ancestors('child').size() ).to.equal( 2 ) // excludes cousin
                    expect( great.ancestors('family').first() ).to.equal( family );
                })
                it("should return all siblings of it's parent when untyped", function(){
                    expect( family.ancestors() ).to.be.undefined
                    expect( child.ancestors().value() ).to.equal( cousin.ancestors().value() );
                    expect( great.ancestors().size() ).to.equal( 2 )
                })
            })
            describe('Traversal', function(){
                it("should return itself when traversing from the root", function(){
                    expect(family.next()).to.equal(family)
                    expect(family.prev()).to.equal(family)
                })
                it("should return it's next sibling when traversing forward", function(){
                    expect(parent.next()).to.equal(uncle)
                    expect(child.next()).to.equal(sibling)
                    expect(grand.next()).to.equal(grand_sibling)
                }) 
                it("should return it's previous sibling when traversing backwards", function(){
                    expect(uncle.prev()).to.equal(parent)
                    expect(sibling.prev()).to.equal(child)
                    expect(grand_sibling.prev()).to.equal(grand)
                })
                it("should return it's parent when traversing backwards from the head", function(){
                    expect(great.prev()).to.equal(grand)
                    expect(parent.prev()).to.equal(family)
                })
                it("should return the closet unrelated ancestor when traversing forward from the tail", function(){
                    expect(great.next()).to.equal(grand_sibling);
                    expect(grand_sibling.next()).to.equal(sibling);
                    expect(sibling.next()).to.equal(uncle);
                })
                it("should return the root when traversing forward from a leaf node", function(){
                    expect(great.next()).not.to.equal(family);
                    expect(grand_sibling.next()).not.to.equal(family)
                    expect(grand_cousin.next()).not.to.equal(family)

                    expect(uncle.next()).to.equal(family);
                    expect(cousin.next()).to.equal(family)
                })
            })

            beforeEach( function(){
                // Defined as describe in diagram
                parent  =   family.add(parent)
                child   =   parent.add(child)
                grand   =   child.add(grand)
                great   =   grand.add(great)

                grand_sibling = child.add(grand_sibling)
                
                sibling      =  parent.add(sibling)
                grand_cousin =  sibling.add(grand_cousin);

                uncle  = family.add(uncle)
                cousin = uncle.add(cousin)

            })

        })

        beforeEach(function(){
            /**
             *                                 family
             *                                   |
             *                      parent-------------------parent:uncle
             *                        |                           |
             *              child-----------child:sibling    child:cousin
             *                |                  | 
             *     grand---grand:sibling    grand:cousin
             *       |
             *     great
             * 
             */
            
            family = new Protonode({ type: 'family' });
            parent = uncle = { type: 'parent' }
            child = sibling = cousin ={ type: 'child' }
            grand = grand_sibling = grand_cousin = { type: 'grand' }
            great = { type: 'great' }
        })
        
    })

    describe("Taxonomy", function(){
        var Animalia, Mollusca, Cephalopoda, Octopoda, Octopodidae, Octopus, OctopusMarcopus;

        it("should be extensible", function(){
            BiologicalClassification = Protonode.extend({
                /* instance methods  */
                getName: function(){ return this.name }
            },{ /* static properties */
                type: 'BiologicalClassification'
            ,   name: void 0
            })
            var life = new  BiologicalClassification({name:'Life', game:true});
            expect( life ).to.be.instanceof(BiologicalClassification)
            expect( life ).to.have.property('type').that.equals('BiologicalClassification')
            expect( life.getName() ).equals('Life')
        })

        it("should have order", function(){
            expect(Life.child).to.equal(Kingdom)
            expect(Kingdom.child).to.equal(Phylum);
            expect(Phylum.child).to.equal(Class)
            expect(Species.child).to.be.undefined
        })

        it("should have inheritance", function(){
            expect(Kingdom.type).to.equal('Kingdom')
            expect(Animalia.type).to.equal('Kingdom')
            expect(Species.type).to.equal('Species')
            expect(OctopusMarcopus.type).to.equal('Species')

            // Overwrites child attribute correctly
            expect( Genus.child ).to.equal( Species );

            expect(OctopusMarcopus.getName()).to.equal('Octopus Marcopus')
            expect(OctopusMarcopus.ancestor('Kingdom').name).to.equal('Animalia');
            expect
        })

        beforeEach(function(){})

        afterEach(function (done) {

            Life = BiologicalClassification.extend(
                {   name: 'Life'
                ,   game: true 
                ,   add: function(name, properties, options){
                        return Life.__super__.add.call( this
                        ,   _.extend(properties||{}, {name:name})
                        ,   options
                        )
                    }
                }
            ,   {   begets: function( type, classProperties, instanceMethods ){
                        return ( this.child = Life.extend( instanceMethods
                            ,  _.extend( classProperties || {}, {   type:type, child: void 0   } )
                            )
                        )
                    }
                }
            )

            Kingdom = Life.     begets( 'Kingdom' )
            Phylum  = Kingdom.  begets( 'Phylum'  )
            Class   = Phylum.   begets( 'Class'   )
            Order   = Class.    begets( 'Order'   )
            Family  = Order.    begets( 'Family'  )
            Genus   = Family.   begets( 'Genus'   )
            Species = Genus.    begets( 'Species' )
            
            var Earth; 
            Earth = new Life({
                name:'Earth'
            });
            Animalia = Earth
                .add( 'Animalia' )
            Mollusca = Animalia
                .add( 'Mollusca'         )
            Cephalopoda = Mollusca
                .add( 'Cephalopoda'      )
            Octopoda = Cephalopoda
                .add( 'Octopoda'         )
            Octopodidae = Octopoda
                .add( 'Octopodidae'      ) 
            Octopus = Octopodidae
                .add( 'Octopus'          )
            OctopusMarcopus = Octopus
                .add( 'Octopus Marcopus' )
            ;

            return done();
        });

    })

 })


