/**
 * Created by jmartinez on 6/27/16.
 */
if(Meteor.isServer){
    Meteor.publish('buildings', function(southWest, northEast){
        return buildings_centroids.find({geometry: {$geoWithin:{$geometry:{ type: "Polygon", coordinates: [[[southWest.lng, southWest.lat], [southWest.lng, northEast.lat], [northEast.lng, northEast.lat], [northEast.lng, southWest.lat], [southWest.lng, southWest.lat]]]}}}});
    });

    Meteor.publish('selected_building', function(id){
        console.log(id);
        
        console.log(urbansim_buildings.find({plan_id: id}).count());
        return urbansim_buildings.find({plan_id: id});
    });
}