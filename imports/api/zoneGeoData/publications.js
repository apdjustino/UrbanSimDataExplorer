/**
 * Created by jmartinez on 4/26/16.
 */

if(Meteor.isServer){
    
    Meteor.publish('zoneGeoData', function(){
        return zoneGeoData.find({});
    });
    
}