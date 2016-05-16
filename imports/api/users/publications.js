/**
 * Created by jmartinez on 4/6/16.
 */
import {check} from 'meteor/check';
if(Meteor.isServer){

    Meteor.publish("users", function(){
        if(this.userId){
            return Meteor.users.find({}, {fields:{services:0}});
        }
    });
    
    Meteor.publish("enrolledUser", function(token){
        return Meteor.users.find({"services.password.reset.token": token});
    });
    
}