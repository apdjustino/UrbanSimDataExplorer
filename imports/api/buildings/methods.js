/**
 * Created by jmartinez on 6/27/16.
 */
Meteor.methods({
    findBuldingsInZone: function(zone_id){
        return buildings.find({'properties.zone_id': zone_id}).fetch();
    }, findBuildingsInUc: function(NAME){
        return buildings.find({'properties.urban_cent': NAME}).fetch();
    }
});