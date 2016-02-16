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

}