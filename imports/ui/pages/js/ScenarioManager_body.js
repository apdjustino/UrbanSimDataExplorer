/**
 * Created by jmartinez on 10/10/16.
 */

import {zoningScenarioClickEvents} from '../../components/CesiumMapFunctions';
import {setZoneClickEvents} from '../../components/CesiumMapFunctions';
import {drawBoundariesClickEvents} from '../../components/CesiumMapFunctions';
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
                            Session.set('selectedScenario', name);
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
            var scenarioName = Session.get('selectedScenario');
            var scenarioData = scenarios.findOne({scenarioName: scenarioName});
            return {
                modalId: "ScenarioModal",
                bottom: "",
                modalHeaderTemplate: "ScenarioModalHeader",
                modalBodyTemplate: "ScenarioModalBody",
                data: scenarioData
            }
        }, ScenarioList_args: function(){
            return {
                listData: scenarios.find({}, {fields:{scenarioName:1}}).fetch(),
                listItemTemplate: "ScenarioListItem"
            }
        }, EditFAR_args: function(){
            return {
                modalId: "EditFARModal",
                bottom: "",
                modalHeaderTemplate: "EditFARModalHeader",
                modalBodyTemplate: "EditFARModalBody",
                data: undefined
            }
        }
    });


    Template.ScenarioManager_body.onCreated(function(){
        //create template reactive variables


        
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

    Template.ScenarioListItem.events({
        "click .removeButton": function(event, template){
            var name = event.target.parentElement.id.split('-')[0];
            Meteor.call("removeScenario", name);
        }, "click .editButton": function(event, template){
            var name = event.target.parentElement.id.split('-')[0];
            Session.set('selectedScenario', name);
            $('#ScenarioModal').openModal();
        }
    });

    Template.zoningScenarioControls.events({
        "click #startZoningScenario": function(event, template){
            event.preventDefault();
            $('#ScenarioModal').closeModal();
            $('#zoningScenarioToolBar').css('visibility', 'visible');

            //set click handler to scenario in order to load parcels on click
            Session.set('parcelCount', 0);
            zoningScenarioClickEvents();
        }
    });

    Template.ScenarioToolBar.events({
        "click #saveZoningScenario": function(event, template){
            event.preventDefault();
            $('.fixed-action-btn').closeFAB();
            $('#zoningScenarioToolBar').css('visibility', 'hidden');
            setZoneClickEvents();
        }, "click #toggleDrawBoundary": function(event, template){
            event.preventDefault();
            drawBoundariesClickEvents();
            
        }, "click #editFAR": function(event, template){
            event.preventDefault();
            $('#EditFARModal').openModal();
        }
    });
    
    Template.ScenarioToolBar.helpers({
        selectedParcelCount: function(){
            return Session.get('parcelCount');
        }
    });


    Template.ScenarioToolBar.onRendered(function(){
        $('.tooltipped').tooltip({delay: 50});
    });




}