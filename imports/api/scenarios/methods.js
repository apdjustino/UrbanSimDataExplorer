/**
 * Created by jmartinez on 10/13/16.
 */
Meteor.methods({
    "addNewScenario": function(name){
        if(!Meteor.userId()){
            throw new Meteor.Error('Not logged in.');
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                var dataToSend = {
                    scenarioName: name
                };
                scenarios.insert(dataToSend);
                
                return true;
                
            }else{
                return false;
            }
        }
    }
});