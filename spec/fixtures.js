var classifications = 
    _(['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
    .reduceRight( function( aggregator, type ){
            return aggregator.push ( 
                Protonode.extend({
                    type: type.toLowerCase()
                ,   child: _.last(aggregator)
                })
            )
        }
        , _([]) 
    )
    .reduceRight( function( classifications, node ){
            classifications[node.type] = node
            return classifications
        }
    ,   {}
    )
;   

   