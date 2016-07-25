/**
 * Created by jmartinez on 6/27/16.
 */
Meteor.methods({
    findBuildings: function(ids){
        return buildings.find({'properties.Building_I': {$in: ids}}).fetch();   
    }
});