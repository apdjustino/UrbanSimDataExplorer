/**
 * Created by jmartinez on 5/24/16.
 */
if(Meteor.isServer){

    Meteor.publish('commentById', function(id){
        return Comments.get(id);
    });

    Meteor.publish('commentsByZone', function(year){
        var re = new RegExp(year);
        return Comments.getCollection().find({referenceId: {$regex: re}});
    })

}
