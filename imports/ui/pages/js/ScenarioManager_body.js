/**
 * Created by jmartinez on 10/10/16.
 */
if(Meteor.isClient){

    Template.ScenarioManager_body.events({
        "submit #newScenarioForm": function(event, template){
            event.preventDefault();
            var name = $('#newScenarioName').val();
            if(name.length > 0){

            }else{
                Materialize.toast("Invalid Scenario Name", 5000);
            }
        }
    });

    Template.ScenarioManager_body.helpers({
        scenarioNames: function(){
            return scenarios.find({}, {fields:{scenarioName:1}}).fetch();
        }, numberOfScenarios: function(){
            var count = scenarios.find({}).fetch().length;
            return (count > 0);
        }
    });


    Template.ScenarioManager_body.onCreated(function(){
        var self = this;
        this.autorun(function(){
            self.subscribe('scenarios');
        });
    });


}