/**
 * Created by jmartinez on 8/10/16.
 */
import {findZoneData} from '../../components/CesiumMapFunctions.js';
import {findCountyData} from '../../components/CesiumMapFunctions.js';
import {findUrbanCenterData} from '../../components/CesiumMapFunctions.js';
import {findMuniData} from '../../components/CesiumMapFunctions.js';
import {addSource} from '../../components/CesiumMapFunctions.js';
import {addNewBuildings} from '../../components/CesiumMapFunctions.js';
import {subscribeToCity} from '../../components/CesiumMapFunctions.js';
import {subscribeToCounty} from '../../components/CesiumMapFunctions.js';
import {subscribeToUrbanCenter} from '../../components/CesiumMapFunctions.js';


if(Meteor.isClient){

    Template.FindZoneControl_body.helpers({
        label: function(data){
            var layerMap = {
                zonesGeo: "Zone ID",
                municipalities: "Municipality",
                county_web: "County",
                urban_centers: "Urban Center Name"
            };

            return layerMap[data];
        }, isUrbanCenter: function(layer){
            return (layer == 'urban_centers');
        }, isCounty: function(layer){
            return (layer == 'county_web')
        }, isZones: function(layer){
            return (layer == 'zonesGeo');
        }, isMunis: function(layer){
            return (layer == 'municipalities');
        }, uc_muniList_args: function(layer){
            var listData;
            if(layer === 'urban_centers'){
                listData = _.uniq(Template.instance().urbanCenters.get().map(function(x){return {name: x.NAME, layer: Template.instance().data}}));
            }else if(layer == 'county_web'){
                listData = _.uniq(Template.instance().counties.get().map(function(x){return {name: x.county_name, layer: Template.instance().data}}));
            }else if(layer == 'municipalities'){
                listData = _.uniq(Template.instance().cities.get().map(function(x){return {name: x.city_name, layer: Template.instance().data}}));
            }
            return {
                listData: listData,
                listItemTemplate: "uc_muniList_list_item"
            }
        }
    });

    Template.FindZoneControl_body.events({
        "submit #findAZone": function(event, template){
            event.preventDefault();
            var mapName = FlowRouter.getRouteName();
            var zoneId = $('#zoneSearch').val();
            var year = Session.get('selectedYear');
            if(mapName == '3dmap'){
                var ds = viewer.dataSources.get(0);

                var entity = _.find(ds.entities.values, function(x){return x.properties.zone_str == zoneId});
                if(entity){
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(entity.properties.Long, entity.properties.Lat, 4000),
                        duration: 4,
                        complete: function(){
                            viewer.entities.add({
                                polygon: {
                                    hierarchy: entity.polygon.hierarchy,
                                    material: new Cesium.Color(1,1,0,1, .7)
                                }
                            });
                            findZoneData(zoneId, Session.get('selectedYear'));
                            if(zoneComments){
                                zoneComments.stop();
                                zoneComments = Meteor.subscribe('commentsByZone', year);
                            }else{
                                zoneComments = Meteor.subscribe('commentsByZone', year);
                            }
                        }
                    });

                }else{
                    Materialize.toast("Zone: " + zoneId + " not found.", 4000);
                }




            }else{

                // var selector = '#id-' + zoneId;
                // console.log(d3.select(selector).datum(function(d){console.log(d)}))

                //code for displaying error message

                if(isNaN(parseInt(zoneId))){
                    Materialize.toast("Zone: " + zoneId + " not found.", 4000);
                }else{
                    if(parseInt(zoneId) > 2804 || parseInt(zoneId) < 1){
                        Materialize.toast("Zone: " + zoneId + " not found.", 4000);
                    }
                }

                d3.selectAll('.entity').attr("class", function(d){
                    if(d.properties.ZONE_ID == zoneId){
                        var lat = d.properties.Lat;
                        var long = d.properties.Long;
                        map.setView(new L.LatLng(lat, long), 13, {animate:true});
                        findZoneData(zoneId, Session.get('selectedYear'));
                        if(zoneComments){
                            zoneComments.stop();
                            zoneComments = Meteor.subscribe('commentsByZone', year);
                        }else{
                            zoneComments = Meteor.subscribe('commentsByZone', year);
                        }
                        return "entity selected"
                    }else{
                        return "entity"
                    }

                });

            }



        }
    });



    Template.FindZoneControl_body.onCreated(function(){
        var self = this;

        this.autorun(function(){
            Meteor.call('getCityNames', function(error, response){
                if(error){
                    Materialize.toast(error.reason, 4000);
                }else{
                    self.cities = new ReactiveVar(response);
                }
            });
            
            Meteor.call('getUCNames', function(error, response){
                if(error){
                    Materialize.toast(error.reason, 4000);
                }else{
                    self.urbanCenters = new ReactiveVar(response);
                }
            });

            Meteor.call('getCountyNames', function(error, response){
                if(error){
                    Materialize.toast(error.reason, 4000);
                }else{
                    self.counties = new ReactiveVar(response);
                }
            });





        });


    });

    Template.uc_muniList_list_item.events({
        "click .zoomTo": function(event, template){
            var mapName = FlowRouter.getRouteName();
            var year = Session.get('selectedYear');
            var selectedZones = Session.get('selectedZone');


            if(mapName == '3dmap'){
                var ds = viewer.dataSources.get(0);
                if(template.data.layer == 'urban_centers'){
                    var NAME = template.data.name;
                    var entity = _.find(ds.entities.values, function(x){return x.properties.NAME == NAME});
                    if(entity){
                        viewer.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(entity.properties.Long, entity.properties.Lat, 4000),
                            duration: 4,
                            complete: function(){
                                Session.set('spinning', true);
                                Meteor.call('findBuildingsInUc', NAME, function(error, response){
                                    if(error){
                                        Materialize.toast(error.reason, 4000);
                                    }else{
                                        var year = Session.get('selectedYear');
                                        var source = new Cesium.GeoJsonDataSource('src-'+ NAME);
                                        var new_source = new Cesium.GeoJsonDataSource('newBuildings');
                                        if(Session.equals('allowMultipleGeo', false)){
                                            if(selectedZones.length > 0){
                                                Session.set('spinning', false);
                                                var dataSourcesCount = viewer.dataSources.length - 1;
                                                for(var i=dataSourcesCount; i> 0; i--){
                                                    viewer.dataSources.remove(viewer.dataSources.get(i), true);
                                                }
                                                if(NAME != selectedZones[0]){

                                                    viewer.dataSources.add(source);
                                                    addSource(source, response);

                                                    if(year != 2010){
                                                        Meteor.call('findNewBuildingsInUc', [NAME], year, function(error, res){
                                                            if(error){
                                                                Materialize.toast(error.reason, 4000);
                                                            }else{
                                                                viewer.dataSources.add(new_source);
                                                                addNewBuildings(new_source, res, year);
                                                            }
                                                        });
                                                    }

                                                }
                                            }else{
                                                viewer.dataSources.add(source);
                                                addSource(source, response);

                                                if(year != 2010){
                                                    Meteor.call('findNewBuildingsInZone', [NAME], year, function(error, res){
                                                        if(error){
                                                            Materialize.toast(error.reason, 4000);
                                                        }else{
                                                            viewer.dataSources.add(new_source);
                                                            addNewBuildings(new_source, res, year);
                                                        }
                                                    });
                                                }
                                            }
                                        }else{
                                            if(_.contains(selectedZones, NAME)){
                                                viewer.dataSources._dataSources.forEach(function(src, idx){
                                                    Session.set('spinning', false);
                                                    if(src._name.split('-')[1] == NAME.toString()){
                                                        viewer.dataSources.remove(viewer.dataSources.get(idx), true);
                                                    }
                                                });
                                            }else{
                                                viewer.dataSources.add(source);
                                                addSource(source, response);
                                                if(year != 2010){
                                                    Meteor.call('findNewBuildingsInUc', [NAME], year, function(error, res){
                                                        if(error){
                                                            Materialize.toast(error.reason, 4000);
                                                        }else{
                                                            viewer.dataSources.add(new_source);
                                                            addNewBuildings(new_source, res, year);
                                                        }
                                                    });
                                                }
                                            }
                                        }

                                    }
                                });
                                findUrbanCenterData(NAME, year);
                                if(zoneComments){
                                    zoneComments.stop();
                                    zoneComments = Meteor.subscribe('commentsByZone', year);
                                }else{
                                    zoneComments = Meteor.subscribe('commentsByZone', year);
                                }
                            }
                        });

                    }else{
                        Materialize.toast("Zone: " + zoneId + " not found.", 4000);
                    }
                }
                else if(template.data.layer == 'county_web'){
                    var entity = _.find(ds.entities.values, function(x){return x.properties.COUNTY == template.data.name});
                    if(entity){
                        viewer.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(entity.properties.Long, entity.properties.Lat, 15000),
                            duration: 4,
                            complete: function(){
                                viewer.entities.add({
                                    polygon: {
                                        hierarchy: entity.polygon.hierarchy,
                                        material: new Cesium.Color(1,1,0,1, .7)
                                    }
                                });
                                findCountyData(template.data.name, Session.get('selectedYear'));
                                if(zoneComments){
                                    zoneComments.stop();
                                    zoneComments = Meteor.subscribe('commentsByZone', year);
                                }else{
                                    zoneComments = Meteor.subscribe('commentsByZone', year);
                                }
                            }
                        });

                    }else{
                        Materialize.toast("Zone: " + zoneId + " not found.", 4000);
                    }
                }
                else if(template.data.layer == 'municipalities'){
                    var entity = _.find(ds.entities.values, function(x){return x.properties.CITY == template.data.name});
                    if(entity){
                        viewer.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(entity.properties.Long, entity.properties.Lat, 15000),
                            duration: 4,
                            complete: function(){
                                viewer.entities.add({
                                    polygon: {
                                        hierarchy: entity.polygon.hierarchy,
                                        material: new Cesium.Color(1,1,0,1, .7)
                                    }
                                });
                                subscribeToCity(Session.get('selectedYear'), [template.data.name]);
                                if(zoneComments){
                                    zoneComments.stop();
                                    zoneComments = Meteor.subscribe('commentsByZone', year);
                                }else{
                                    zoneComments = Meteor.subscribe('commentsByZone', year);
                                }
                            }
                        });

                    }else{
                        Materialize.toast("Zone: " + zoneId + " not found.", 4000);
                    }
                }
            }else{
                if(template.data.layer == 'urban_centers'){

                    Session.set('selectedZone', [template.data.name]);
                    subscribeToUrbanCenter(Session.get('selectedYear'), [template.data.name]);
                    if(zoneComments){
                        zoneComments.stop();
                        zoneComments = Meteor.subscribe('commentsByZone', year);
                    }else{
                        zoneComments = Meteor.subscribe('commentsByZone', year);
                    }

                    d3.selectAll('.entity').attr("class", function(d){
                        if(d.properties.NAME == template.data.name){
                            var lat = d.properties.Lat;
                            var long = d.properties.Long;
                            map.setView(new L.LatLng(lat, long), 11, {animate:true});

                            return "entity selected"
                        }else{
                            return "entity"
                        }

                    });
                }else if(template.data.layer == 'municipalities'){

                    Session.set('selectedZone', [template.data.name]);
                    subscribeToCity(Session.get('selectedYear'), [template.data.name]);
                    if(zoneComments){
                        zoneComments.stop();
                        zoneComments = Meteor.subscribe('commentsByZone', year);
                    }else{
                        zoneComments = Meteor.subscribe('commentsByZone', year);
                    }


                    d3.selectAll('.entity').attr("class", function(d){
                        if(d.properties.CITY == template.data.name){
                            var lat = d.properties.Lat;
                            var long = d.properties.Long;
                            map.setView(new L.LatLng(lat, long), 11, {animate:true});
                            return "entity selected"
                        }else{
                            return "entity"
                        }

                    });
                }else if(template.data.layer == 'county_web'){
                    Session.set('selectedZone', [template.data.name]);
                    subscribeToCounty(Session.get('selectedYear'), [template.data.name]);
                    if(zoneComments){
                        zoneComments.stop();
                        zoneComments = Meteor.subscribe('commentsByZone', year);
                    }else{
                        zoneComments = Meteor.subscribe('commentsByZone', year);
                    }


                    d3.selectAll('.entity').attr("class", function(d){
                        if(d.properties.COUNTY == template.data.name){
                            var lat = d.properties.Lat;
                            var long = d.properties.Long;
                            map.setView(new L.LatLng(lat, long), 11, {animate:true});
                            return "entity selected"
                        }else{
                            return "entity"
                        }

                    });
                }
            }


        }
    });

    Template.FindZoneControl_body.onCreated(function(){
        var self = this;
        this.autorun(function(){
            self.subscribe('uc_by_year', 2010, 'hh_sim');
            self.subscribe('counties_by_year', 2010, 'hh_sim');
            self.subscribe('cities_by_year', 2010, 'hh_sim')
        })
    });



}