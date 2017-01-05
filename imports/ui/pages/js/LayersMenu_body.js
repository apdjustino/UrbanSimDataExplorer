/**
 * Created by jmartinez on 8/4/16.
 */
import {drawMap} from '../../../startup/client/mapFunctions.js';
import {setCityClickEvents} from '../../components/CesiumMapFunctions.js';
import {setZoneClickEvents} from '../../components/CesiumMapFunctions.js';
import {setCountyClickEvents} from '../../components/CesiumMapFunctions.js';
import {setUrbanCenterClickEvents} from '../../components/CesiumMapFunctions.js';
import {subscribeToCounty} from '../../components/CesiumMapFunctions.js';
if(Meteor.isClient){

    Template.LayersMenu_body.events({
        "click .layerBtn": function(event, template){
            event.preventDefault();
            Session.set('spinning', true);
            Session.set('selectedLayer', event.target.id);
            Session.set('selectedZone', []);
            Session.set('selectedData', undefined);
            Session.set('queryColorRanges', undefined);
            if(viewer){
                viewer.entities.removeAll();
            }
            var mapName = FlowRouter.getRouteName();
            var layer = event.target.id;

            var allCounties = ['Boulder', 'Broomfield', 'Denver', 'Adams', 'Arapahoe', 'Douglas', 'Jefferson', 'Weld', 'Gilpin', 'Clear Creek', 'Elbert'];
            subscribeToCounty(2010, allCounties);


            $('.layerBtn').each(function(idx, el){
                $(el).removeClass('orange');
            });

            $(event.target).addClass('orange');


            var leafletParamMap = {
                zonesGeo: {
                    pathString: "/data/zonesGeo.json",
                    obj_name: "zonesGeo",
                    label_string: "ZoneId: ",
                    geo_property: "ZONE_ID",
                    tazId: "TAZ_ID",
                    geo_class: "entity"
                }, municipalities: {
                    pathString: "/data/municipalities.json",
                    obj_name: "municipalities",
                    label_string: "City: ",
                    geo_property: "CITY",
                    tazId: "",
                    geo_class: "entity"
                }, county_web: {
                    pathString: "/data/county_web.json",
                    obj_name: "county_web",
                    label_string: "County: ",
                    geo_property: "COUNTY",
                    tazId: "",
                    geo_class: "entity"
                }, urban_centers: {
                    pathString: "/data/urban_centers.json",
                    obj_name: "urban_centers_reg",
                    label_string: "Urban Center: ",
                    geo_property: "NAME",
                    tazId: "",
                    geo_class: "entity"
                }
            };


            if(mapName == '3dmap'){
                if(viewer){
                    viewer.dataSources.removeAll(true);
                    var promise = Cesium.GeoJsonDataSource.load(leafletParamMap[layer].pathString, {
                        stroke: Cesium.Color.BLACK,
                        fill: new Cesium.Color(0.01,0.01,0.01,0.01)
                    });
                    promise.then(function(dataSource){
                        Session.set('spinning', false);
                        viewer.dataSources.add(dataSource);
                        if(layer == 'zonesGeo'){
                            setZoneClickEvents()
                        }else if(layer == 'municipalities'){
                            setCityClickEvents();
                        }else if(layer == 'county_web'){
                            setCountyClickEvents();
                        }else{
                            setUrbanCenterClickEvents();
                        }

                    }).otherwise(function(error){
                        //Display any errrors encountered while loading.
                        window.alert(error);
                    });
                }else{
                    alert("Cesium Viewer error");
                }
            }else{

                drawMap(leafletParamMap[layer]);
            }
        }
    })

}