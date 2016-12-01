/**
 * Created by jmartinez on 10/10/16.
 */

import {zoningScenarioClickEvents} from '../../components/CesiumMapFunctions';
import {setZoneClickEvents} from '../../components/CesiumMapFunctions';
import {drawBoundariesClickEvents} from '../../components/CesiumMapFunctions';
import {addParcels} from '../../components/CesiumMapFunctions';


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
                            $('#ScenarioModal').openModal({
                                complete: function(){
                                    Session.set('selectedScenario', undefined);
                                }
                            });
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
            $('#ScenarioModal').openModal({
                complete: function(){
                    Session.set('selectedScenario', undefined);
                }
            });
        }, "click .showButton": function(event, template){
            var name = event.target.parentElement.id.split('-')[0];
            Session.set('selectedScenario', name);
            var hasParcels = scenarios.findOne({scenarioName:name}).hasOwnProperty('parcels');
            if(hasParcels){
                var scenarioItems = [].concat.apply([], scenarios.findOne({scenarioName:name}).parcels);
                var scenarioParcelIds = _.pluck(scenarioItems, 'parcelId');

                Meteor.call('findParcels', scenarioParcelIds, function(error, response){
                    if(error){
                        Materialize.toast(error.reason, 5000);
                    }else{
                        var dataSourcesCount = viewer.dataSources.length - 1;
                        for(var i=dataSourcesCount; i> 0; i--){
                            viewer.dataSources.remove(viewer.dataSources.get(i), true);
                        }

                        var source = new Cesium.GeoJsonDataSource('parcels');
                        viewer.dataSources.add(source);
                        addParcels(source, response);

                    }
                });
            }else{
                Materialize.toast('This scenario has no parcels. Edit scenario to include parcel changes');
            }



        }
    });

    Template.ScenarioListItem.helpers({
        isScenarioActive: function(name){

            var selectedScenario = Session.get('selectedScenario');
            if(name == selectedScenario){
                return 'orange';
            }else{
                return ''
            }
        }
    });

    Template.zoningScenarioControls.events({
        "click #startZoningScenario": function(event, template){
            event.preventDefault();
            $('#ScenarioModal').closeModal();
            $('#zoningScenarioToolBar').css('visibility', 'visible');

            //set click handler to scenario in order to load parcels on click
            Session.set('parcelCount', 0);
            Session.set('selectedZone', undefined);
            zoningScenarioClickEvents();
        }
    });

    Template.ScenarioToolBar.events({
        "click #saveZoningScenario": function(event, template){
            event.preventDefault();
            var scenario = Session.get('selectedScenario');
            var selection = Session.get('scenarioSelection');
            Meteor.call('updateSelection', scenario, selection, function(error, response){
                if(error){
                    Materialize.toast(error.reason, 5000);
                }else{
                    if(response){
                        Materialize.toast('Scenario Update Saved!', 5000);
                    }else{
                        Materialize.toast('Not authorized to update scenarios', 5000);
                    }

                }
            });

        }, "click #toggleDrawBoundary": function(event, template){
            event.preventDefault();
            if(!$('#toggleDrawBoundary').hasClass('disabled')){
                drawBoundariesClickEvents();
            }

            
        }, "click #editFAR": function(event, template){
            event.preventDefault();
            if(!$('#editFAR').hasClass('disabled')){
                $('#EditFARModal').openModal();
            }
        }, "click #leaveScenarioEditor": function(event, template){
            event.preventDefault();
            $('.fixed-action-btn').closeFAB();
            $('#zoningScenarioToolBar').css('visibility', 'hidden');
            Session.set('selectedScenario', undefined);

            var dataSourcesCount = viewer.dataSources.length - 1;
            for(var i=dataSourcesCount; i> 0; i--){
                viewer.dataSources.remove(viewer.dataSources.get(i), true);
            }
            
            setZoneClickEvents();
        }
    });
    
    Template.ScenarioToolBar.helpers({
        selectedParcelCount: function(){
            return Session.get('parcelCount');
        }, isZoneSelected: function(){
            var selectedZone = Session.get('selectedZone');
            if(selectedZone){
                return "";
            }else{
                return "disabled";
            }
        }
    });

    Template.ScenarioListItem.onRendered(function(){
        $('.tooltipped').tooltip({delay: 50});
    });

    Template.ScenarioToolBar.onRendered(function(){
        $('.tooltipped').tooltip({delay: 50});
    });


    Template.EditFARModalBody.events({
        "click #btnUpdateFAR": function(event, template){
            event.preventDefault();
            var selection = Session.get('scenarioSelection');
            var newFar = parseFloat($('#newFARValue').val());

            for(var i=0; i<selection.length; i++){
                selection[i].far = newFar;
            }

            Session.set('scenarioSelection', selection);

            var source = viewer.dataSources.get(1);
            var entities = source.entities.values;

            for(var j=0; j<entities.length; j++){
                var entity = entities[j];
                if(_.contains(_.map(selection, function(x){return x.parcel_id}), entity.properties.parcel_id)){
                    entity.polygon.extrudedHeight = Math.ceil(newFar) * 15;
                    if(newFar == 0){
                        entity.polygon.material = Cesium.Color.DARKORANGE;
                        entity.polygon.outlineColor = Cesium.Color.BLACK;
                    }else{
                        entity.polygon.material = Cesium.Color.BLUE;
                        entity.polygon.outlineColor = Cesium.Color.BLACK;
                    }
                }
            }
        }
    });
    
    Template.EditFARModalBody.helpers({
        ParcelList_args: function(){
            return {
                listData: Session.get('scenarioSelection'),
                listItemTemplate: "ScenarioSelectionParcelList"
            }
        }
    });
    





}