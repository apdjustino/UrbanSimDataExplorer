/**
 * Created by jmartinez on 10/13/16.
 */
if(Meteor.isServer){
    
    Meteor.publish('scenarios', function(){
        return scenarios.find({});
    });
    
}