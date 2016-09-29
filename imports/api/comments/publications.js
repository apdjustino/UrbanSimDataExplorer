/**
 * Created by jmartinez on 5/24/16.
 */
if(Meteor.isServer){

    Meteor.publish('commentById', function(id){
        return Comments.get(id);
    });
<<<<<<< HEAD
    
=======

>>>>>>> b018a3f5d43585de45050ba9a0b60e4f45cef8fd
    Meteor.publish('commentsByZone', function(year){
        var re = new RegExp(year);
        return Comments.getCollection().find({referenceId: {$regex: re}});
    })

}