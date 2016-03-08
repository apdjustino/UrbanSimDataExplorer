/**
 * Created by jmartinez on 2/16/2016.
 */
if(Meteor.isClient){


    Meteor.subscribe("fields");

}

if(Meteor.isServer){


    Meteor.publish("fields", function(){
        return fields.find({});
    });

    Meteor.publish("individual_zone", function(year, zone_id){
        return zoneData.find({sim_year:year, zone_id:zone_id});
    });

    Meteor.startup(function(){
        zoneData._ensureIndex({sim_year:1, zone_id:1});
    });

}