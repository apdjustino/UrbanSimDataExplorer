/**
 * Created by jmartinez on 7/8/16.
 */
Meteor.methods({
    "getCommentZones": function(){
        if(!Meteor.userId()){
            throw new Meteor.Error("Not logged in");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin','drcog'])){
                return _.uniq(Comments.getCollection().find({}).fetch().map(function(c){
                    var areaName = c.referenceId.split('-')[0];

                    if(isNaN(parseInt(areaName))){
                        return areaName;
                    }else{
                        return parseInt(areaName)
                    }
                }));
            }
        }
        
    }
});