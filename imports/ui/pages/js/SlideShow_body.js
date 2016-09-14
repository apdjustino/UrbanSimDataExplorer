/**
 * Created by jmartinez on 9/12/16.
 */
import {addSource} from '../../components/CesiumMapFunctions.js';
import {addNewBuildings} from '../../components/CesiumMapFunctions.js';
if(Meteor.isClient){

    Template.SlideShow_body.events({
        "click #btnAddLocale": function(event, template){
            event.preventDefault();
            var name = $('#localeSelect').val();
            Session.set('spinning', true);
            var locale = {
                uc_name: [name]
            };

            Meteor.call("findBuildingsInUc", locale['uc_name'][0], function(error, response){
                if(error){
                    Materialize.toast(error.reason, 4000)
                }else{
                    var dataSourcesCount = viewer.dataSources.length - 1;
                    for(var i=dataSourcesCount; i> 0; i--){
                        viewer.dataSources.remove(viewer.dataSources.get(i), true);
                    }
                    var source = new Cesium.GeoJsonDataSource();
                    var new_source = new Cesium.GeoJsonDataSource();

                    locale["baseData"] = response;
                    viewer.dataSources.add(source);
                    addSource(source, response);

                    var years = [2040];
                    years.forEach(function(cv){
                        Meteor.call("findNewBuildingsInUc", locale['uc_name'], cv, function(error, response){
                            if(error){
                                Materialize.toast(error.reason, 4000);
                            }else{
                                locale["data_" + cv.toString()] = response;
                                viewer.dataSources.add(new_source);
                                addNewBuildings(new_source, response);
                                Meteor.call('addNewLocale', locale);
                                Session.set('spinning', false);

                            }
                        });
                    });
                }
            });





        }, "click #btnAddShot": function(event, target){

        }, "click #btnClearShow": function(event, template){
            event.preventDefault();
            Meteor.call("clearShow");
        }
    });

    Template.SlideShow_body.helpers({
        Options_args: function(){
            var data = _.uniq(ucSummary.find({sim_year:2010}, {sort: {NAME:1}}).fetch().map(function(x){return {value: x.NAME, name: x.NAME}}))
            return {
                multiple: "",
                selectId: "localeSelect",
                selectData: data,
                label: "Urban Centers"
            }
        }, Collapsible_args: function(){
            var data = slideShowData.find({}).fetch().map(function(x){
                return {
                    icon: "flag", headerText: x.uc_name, active:"", body: "LocaleCollapsible_body", bodyData: {shots: x.shots, name: x.uc_name}
                }
            });
            return {
                type: "accordion",
                data: data
            }
        }
    });
    
    Template.LocaleCollapsible_body.helpers({
        ShotList_args: function(){
            return{
                listData: this.shots,
                listItemTemplate: "ShotListItem"
            }
        }
    });

    Template.LocaleCollapsible_body.events({
        "click .btnAddShot": function(event, template){
            event.preventDefault();
            var position = viewer.camera.position;
            var name = this.name;
            var shot = {x: position.x, y: position.y, z: position.z, heading: viewer.camera.heading, pitch: viewer.camera.pitch, roll:viewer.camera.roll};
            Meteor.call('addNewShot', name[0], shot);
        }
    });

    Template.ShotListItem.events({
        "click .btnFlyToShot": function(event, template){
            event.preventDefault();
            viewer.camera.flyTo({
                destination: new Cesium.Cartesian3(this.x, this.y, this.z),
                orientation: {
                    heading: this.heading,
                    pitch: this.pitch,
                    roll: this.roll
                }, maximumHeight: 900,
                duration: 5
            });
        }
    });


    Template.SlideShow_body.onCreated(function(){
        var self = this;
        this.autorun(function(){
            self.subscribe('uc_by_year', 2010, 'hh_sim', {
                onReady: function(){
                    Tracker.afterFlush(function(){$('select').material_select()});
                }
            });

            self.subscribe('slideShowLocales', {
                onReady: function(){
                    Tracker.afterFlush(function(){$('.collapsible').collapsible();})
                }
            });
        });
    })

}