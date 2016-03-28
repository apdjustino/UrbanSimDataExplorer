/**
 * Created by jmartinez on 2/16/2016.
 */
if(Meteor.isClient){


    Meteor.subscribe("fields");
    Meteor.subscribe("users");

}

if(Meteor.isServer){


    Meteor.publish("fields", function(){
        return fields.find({});
    });

    Meteor.publish("individual_zone", function(year, zone_id){
        return zoneData.find({sim_year:year, zone_id:zone_id});
    });

    Meteor.publish("grouped_zones", function(year, zones){
        return zoneData.find({sim_year:year, zone_id:{$in:zones}})
    });

    Meteor.publish("zones_by_year", function(year){
        return zoneData.find({sim_year:year});
    });

    Meteor.startup(function(){
        zoneData._ensureIndex({sim_year:1, zone_id:1});
    });

    Meteor.publish("users", function(){
        if(this.userId){
            return Meteor.users.find({}, {fields:{services:0}});
        }
    })

}