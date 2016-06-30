/**
 * Created by jmartinez on 6/29/16.
 */
if(Meteor.isServer){
    Meteor.publish('parcels', function(southWest, northEast){
        return parcels_centroids.find({geometry: {$geoWithin:{$geometry:{ type: "Polygon", coordinates: [[[southWest.lng, southWest.lat], [southWest.lng, northEast.lat], [northEast.lng, northEast.lat], [northEast.lng, southWest.lat], [southWest.lng, southWest.lat]]]}}}});
    });
}