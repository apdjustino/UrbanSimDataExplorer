/**
 * Created by jmartinez on 6/27/16.
 */
Meteor.methods({
    findBuldingsInZone: function(zone_id){
        return buildings.find({'properties._zone_id': zone_id}).fetch();
    }, findBuildingsInUc: function(NAME){
        return buildings.find({'properties._uc_name': NAME}).fetch();
    }, findNewBuildingsInZone: function(zone_id, year){
        return new_buildings.find({'properties.zone_id': {$in: zone_id}, 'properties.year_built': {$lte: year}}).fetch();
    }, findNewBuildingsInUc: function(name, year){
        return new_buildings.find({'properties.uc_name': {$in: name}, 'properties.year_built': {$lte: year}}).fetch()
    }, addNewLocale: function(name){
        slideShowData.insert(name);
    }, addNewShot: function(name, shot){
        slideShowData.update({uc_name: name}, {$addToSet: {shots: shot}});
    }, getSlideShowData: function(){
        return slideShowData.find({}).fetch();
    }
});