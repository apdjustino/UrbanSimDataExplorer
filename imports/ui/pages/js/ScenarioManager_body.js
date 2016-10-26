/**
 * Created by jmartinez on 10/10/16.
 */
if(Meteor.isClient){

    Template.ScenarioManager_body.events({
        "submit #newScenarioForm": function(event, template){
            event.preventDefault();
            var name = $('#newScenarioName').val();
            if(name.length > 0){
                Meteor.call('addNewScenario', name, function(error, response){
                    if(error){
                        Materialize.toast(error, 5000)
                    }else{
                        if(response){
                            Materialize.toast('Scenario added', 5000);
                            template.selectedScenario.set(name);
                            $('#ScenarioModal').openModal();
                        }else{
                            Materialize.toast('There was an error adding the new scenario', 5000);
                        }
                        
                    }
                })
            }else{
                Materialize.toast("Invalid Scenario Name", 5000);
            }
            $('#newScenarioName').val('');
        }
    });

    Template.ScenarioManager_body.helpers({
        scenarioNames: function(){
            return scenarios.find({}, {fields:{scenarioName:1}}).fetch();
        }, numberOfScenarios: function(){
            var count = scenarios.find({}).fetch().length;
            return (count > 0);
        }, NewScenario_args: function(){
            var scenarioName = Template.instance().selectedScenario.get();
            var scenarioData = scenarios.findOne({scenarioName: scenarioName});
            console.log(scenarioData);
            return {
                modalId: "ScenarioModal",
                bottom: "",
                modalHeaderTemplate: "ScenarioModalHeader",
                modalBodyTemplate: "ScenarioModalBody",
                data: scenarioData
            }
        }
    });


    Template.ScenarioManager_body.onCreated(function(){
        //create template reactive variables

        this.selectedScenario = new ReactiveVar(undefined);

        var self = this;


        this.autorun(function(){
            self.subscribe('scenarios');
        });
    });
    
    Template.ScenarioModalBody.helpers({
        selectedScenarioType: function(){
            return Template.instance().scenarioType.get();
        }
    });

    Template.ScenarioModalBody.events({
        "click .collection-item": function(event, template){
            $('.collection-item').removeClass("active");
            $(event.target).addClass("active");
            template.scenarioType.set(event.target.id);
        }
    });
    
    
    Template.ScenarioModalBody.onCreated(function(){
        this.scenarioType = new ReactiveVar('zoningScenarioControls');
    });


}