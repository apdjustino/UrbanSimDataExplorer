/**
 * Created by jmartinez on 8/10/16.
 */
Meteor.methods({
    getZoneCentroid: function(zoneId){
        if(!Meteor.userId()){
            throw new Meteor.Error('Not logged in.');
        }else{
            var zone = zoneGeoData.findOne({"properties.zone_str": zoneId});
            if(zone){
                return zone.geometry.coordinates;
            }else{
                return "Zone Not Found";
            }
        }
        
    }
})