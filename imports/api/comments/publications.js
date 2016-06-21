/**
 * Created by jmartinez on 5/24/16.
 */
if(Meteor.isServer){
    
    Meteor.publish('commentById', function(id){
        return Comments.get(id);
    });
    
    Meteor.publish('commentsByZone', function(zoneId){
        var re = new RegExp(zoneId);
        return Comments.getCollection().find({referenceId: {$regex: re}});
    })
    
}