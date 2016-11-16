/**
 * Created by jmartinez on 9/7/16.
 */
import {addSource} from '../../components/CesiumMapFunctions.js';
import {colorBuildings} from '../../components/CesiumMapFunctions.js';
import {resetBuildings} from '../../components/CesiumMapFunctions.js';

if(Meteor.isClient){

    Template.Intro_page.onRendered(function(){
        var template = this;
        $.getScript('/scripts/Cesium-1.23/Build/Cesium/Cesium.js', function(){
            var west = -105.5347;
            var south = 39.2663;
            var east = -104.4301;
            var north = 40.246;
            var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

            Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;

            var imageryViewModels = [];
            imageryViewModels.push(new Cesium.ProviderViewModel({
                name: "Mapbox Satellite",
                iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/mapboxSatellite.png'),
                tooltip: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                creationFunction: function(){
                    return new Cesium.MapboxImageryProvider({
                        mapId: 'mapbox.streets-satellite',
                        accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                    })
                }
            }));
            intro_viewer = new Cesium.Viewer('IntroMap', {
                infoBox: false,
                selectionIndicator: false,
                fullscreenButton: false,
                geocoder: false,
                homeButton: true,
                sceneModePicker: false,
                timeline: false,
                navigationHelpButton: true,
                navigationInstructionsInitiallyVisibile: false,
                animation: false,
                baseLayerPicker: true,
                selectedImageryProviderViewModel: imageryViewModels[0]

            });

            intro_viewer.baseLayerPicker.viewModel.imageryProviderViewModels = imageryViewModels;
            intro_viewer.baseLayerPicker.viewModel.terrainProviderViewModels = [];
            intro_viewer.selectedImageryProviderViewModel = imageryViewModels[0];



            intro_viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
            intro_viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
            intro_viewer.scene.screenSpaceCameraController.inertiaZoom = 0;


            //this segment of code load data and flies to the locations in the data

            Session.set('spinning', true);
            Meteor.call('getSlideShowData', function(error, response){
                if(error){
                    Materialize.toast(error.reason, 4000);
                }else{
                    //for each locale in the set
                    var source = new Cesium.GeoJsonDataSource('buildings');


                    function transition(cv){
                        addSource(source, cv.baseData);
                        template.currentUc.set(cv.uc_name);
                        template.newBuildings.set(cv.data_2040);
                        Session.set('spinning', false);

                        var currentValue =  cv.shots[0];
                        intro_viewer.camera.flyTo({
                            destination: new Cesium.Cartesian3(currentValue.x, currentValue.y, currentValue.z),
                            orientation: {
                                heading: currentValue.heading,
                                pitch: currentValue.pitch,
                                roll: currentValue.roll
                            }, maximumHeight: 900,
                            duration: 5
                        });

                        window.setTimeout(function(){
                            newSource.load({
                                type: "FeatureCollection",
                                crs: {
                                    type: "name",
                                    properties: {
                                        name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                                    }
                                },
                                features: cv.data_2040
                            });
                            var entities = newSource.entities.values;


                            for(var i =0; i<entities.length; i++) {
                                var entity = entities[i];
                                entity.polygon.extrudedHeight = entity.properties.height * 3;
                                entity.polygon.material = Cesium.Color.RED;
                                entity.polygon.outlineColor = Cesium.Color.RED;
                            }

                            var j = 0;

                            template.currentYear.set(2040);

                            var interval = window.setInterval(function(){
                                if(j < cv.shots.length){
                                    var currentValue =  cv.shots[j];
                                    intro_viewer.camera.flyTo({
                                        destination: new Cesium.Cartesian3(currentValue.x, currentValue.y, currentValue.z),
                                        orientation: {
                                            heading: currentValue.heading,
                                            pitch: currentValue.pitch,
                                            roll: currentValue.roll
                                        }, maximumHeight: 900,
                                        duration: 4
                                    });
                                    j++;
                                }else{
                                    window.clearInterval(interval);
                                    z++;
                                    if(response[z]){

                                        intro_viewer.dataSources.get(0).entities.removeAll();
                                        intro_viewer.dataSources.get(1).entities.removeAll();

                                        template.currentYear.set(2010);
                                        transition(response[z]);
                                    }else{
                                        z = 0;
                                        transition(response[0]);
                                    }
                                }
                            }, 6000);


                        }, 6000);
                    }


                    // intro_viewer.dataSources.add(source);
                    // intro_viewer.dataSources.add(newSource);

                    //var z = 0;
                    //var cv = response[z];
                    //transition(cv);


                    //add buildings

                    var baseData = response[0].baseData;
                    var uc_name = response[0].uc_name;
                    template.animationData.set(response);

                    addSource(source, baseData);
                    intro_viewer.dataSources.add(source);

                    template.currentUc.set(uc_name);
                    Session.set('spinning', false);

                    var flightData = response[0].shots[0];
                    intro_viewer.camera.flyTo({
                        destination: new Cesium.Cartesian3(flightData.x, flightData.y, flightData.z),
                        orientation: {
                            heading: flightData.heading,
                            pitch: flightData.pitch,
                            roll: flightData.roll
                        }, maximumHeight: 900,
                        duration: 5
                    });



                }
            });

        });
    });

    Template.Intro_page.onCreated(function(){
        this.currentUc = new ReactiveVar(undefined);
        this.newBuildings = new ReactiveVar('');
        this.currentYear = new ReactiveVar(2010);
        this.currentLocaleIdx = new ReactiveVar(0);
        this.currentShotIdx = new ReactiveVar(0);
        this.animationData = new ReactiveVar('');


    });


    Template.Intro_page.helpers({
        currentLocale: function(){
            var cl = Template.instance().currentUc.get();
            if(cl){
                return cl[0];
            }

        }, currentYear: function(){
            return Template.instance().currentYear.get();
        }, isReady: function(cl){
            if(cl){
                return true
            }else{
                return false;
            }
        }
    });

    Template.Intro_page.events({
        "click #after": function(event, template){

            var localeIdx = template.currentLocaleIdx.get();
            var shotIdx = template.currentShotIdx.get();
            var data = template.animationData.get();
            var newShotIdx = shotIdx + 1;

            var flightData;

            if(newShotIdx < data[localeIdx].shots.length){
                template.currentShotIdx.set(newShotIdx);
                flightData = data[localeIdx].shots[newShotIdx];
                intro_viewer.camera.flyTo({
                    destination: new Cesium.Cartesian3(flightData.x, flightData.y, flightData.z),
                    orientation: {
                        heading: flightData.heading,
                        pitch: flightData.pitch,
                        roll: flightData.roll
                    }, maximumHeight: 900,
                    duration: 5
                });
            }else{
                newShotIdx = 0;
                template.currentShotIdx.set(newShotIdx);
                intro_viewer.dataSources.removeAll();
                var newLocaleIdx;
                if(localeIdx < data.length - 1){
                    newLocaleIdx = localeIdx + 1;
                }else{
                    newLocaleIdx = 0;
                }

                template.currentLocaleIdx.set(newLocaleIdx);

                var source = new Cesium.GeoJsonDataSource('buildings');
                addSource(source, data[newLocaleIdx].baseData);
                intro_viewer.dataSources.add(source);

                if($('#chkNewBuildings').prop('checked')){
                    var newSource = new Cesium.GeoJsonDataSource('newBuildings');
                    newSource.load({
                        type: "FeatureCollection",
                        crs: {
                            type: "name",
                            properties: {
                                name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                            }
                        },
                        features: data[newLocaleIdx].data_2040
                    });
                    var entities = newSource.entities.values;
                    for(var i =0; i<entities.length; i++) {
                        var entity = entities[i];
                        entity.polygon.extrudedHeight = entity.properties.height * 3;
                        entity.polygon.material = Cesium.Color.RED;
                        entity.polygon.outlineColor = Cesium.Color.RED;
                    }
                    intro_viewer.dataSources.add(newSource);
                    template.currentYear.set(2040);
                }


                flightData = data[newLocaleIdx].shots[newShotIdx];
                intro_viewer.camera.flyTo({
                    destination: new Cesium.Cartesian3(flightData.x, flightData.y, flightData.z),
                    orientation: {
                        heading: flightData.heading,
                        pitch: flightData.pitch,
                        roll: flightData.roll
                    }, maximumHeight: 900,
                    duration: 5
                });

                template.currentUc.set(data[newLocaleIdx].uc_name);
            }


        }, "click #chkNewBuildings": function(event, template){
            var data = template.animationData.get();
            var localeIdx = template.currentLocaleIdx.get();
            var newSource = new Cesium.GeoJsonDataSource('newBuildings');

            if(event.target.checked){

                newSource.load({
                    type: "FeatureCollection",
                    crs: {
                        type: "name",
                        properties: {
                            name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                        }
                    },
                    features: data[localeIdx].data_2040
                });
                var entities = newSource.entities.values;
                for(var i =0; i<entities.length; i++) {
                    var entity = entities[i];
                    entity.polygon.extrudedHeight = entity.properties.height * 3;
                    entity.polygon.material = Cesium.Color.RED;
                    entity.polygon.outlineColor = Cesium.Color.RED;
                }
                intro_viewer.dataSources.add(newSource);
                template.currentYear.set(2040);
            }else{
                intro_viewer.dataSources.remove(intro_viewer.dataSources.get(1));
                template.currentYear.set(2010);
            }
        }, "click #before": function(event, template){
            var localeIdx = template.currentLocaleIdx.get();
            var shotIdx = template.currentShotIdx.get();
            var data = template.animationData.get();
            var newShotIdx = shotIdx - 1;

            var flightData;

            if(newShotIdx > -1){
                template.currentShotIdx.set(newShotIdx);
                flightData = data[localeIdx].shots[newShotIdx];
                intro_viewer.camera.flyTo({
                    destination: new Cesium.Cartesian3(flightData.x, flightData.y, flightData.z),
                    orientation: {
                        heading: flightData.heading,
                        pitch: flightData.pitch,
                        roll: flightData.roll
                    }, maximumHeight: 900,
                    duration: 5
                });
            }else{

                template.currentShotIdx.set(newShotIdx);
                intro_viewer.dataSources.removeAll();
                var newLocaleIdx;
                if(localeIdx > 0){
                    newLocaleIdx = localeIdx - 1;
                }else{
                    newLocaleIdx = data.length - 1;

                }

                newShotIdx = data[newLocaleIdx].shots.length - 1;
                template.currentShotIdx.set(newShotIdx);

                template.currentLocaleIdx.set(newLocaleIdx);

                var source = new Cesium.GeoJsonDataSource('buildings');
                addSource(source, data[newLocaleIdx].baseData);
                intro_viewer.dataSources.add(source);

                if($('#chkNewBuildings').prop('checked')){
                    var newSource = new Cesium.GeoJsonDataSource('newBuildings');
                    newSource.load({
                        type: "FeatureCollection",
                        crs: {
                            type: "name",
                            properties: {
                                name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                            }
                        },
                        features: data[newLocaleIdx].data_2040
                    });
                    var entities = newSource.entities.values;
                    for(var i =0; i<entities.length; i++) {
                        var entity = entities[i];
                        entity.polygon.extrudedHeight = entity.properties.height * 3;
                        entity.polygon.material = Cesium.Color.RED;
                        entity.polygon.outlineColor = Cesium.Color.RED;
                    }
                    intro_viewer.dataSources.add(newSource);
                    template.currentYear.set(2040);
                }


                flightData = data[newLocaleIdx].shots[newShotIdx];
                intro_viewer.camera.flyTo({
                    destination: new Cesium.Cartesian3(flightData.x, flightData.y, flightData.z),
                    orientation: {
                        heading: flightData.heading,
                        pitch: flightData.pitch,
                        roll: flightData.roll
                    }, maximumHeight: 900,
                    duration: 5
                });

                template.currentUc.set(data[newLocaleIdx].uc_name);
            }
        }, "click #styleBuildingsUC": function(event, template){
            if(event.target.checked){
                var dataSource;
                var buildingColors = {
                    single_family_residential: "#D99937",
                    condo: "#A22E3B",
                    apartment: "#E95D22",
                    townhome: "#4490AF",
                    mobile_home: "#626262",
                    retail: "#1D4E89",
                    warehousing: "#FBC254",
                    agriculture: "#DECDBF",
                    office: "#739B4E",
                    "quasi-public": "#9D8169",
                    industrial: "#9E61B0",
                    restaurant: "#B5BF4F",
                    school: "#CF5D6B",
                    recreation: "#4CAF50",
                    parking: "#5F5F5F",
                    tcu: "#F66CA8",
                    "mixed use with residential": "#753D16",
                    mixed_use: "#8AD9DE",
                    hospital: "#1655AC",
                    group_quarters: "#EBC76C",
                    lodging: "#513D27",
                    casino: "#59F2A7",
                    military: "#0C0202"
                };
                console.log('test');

                for(i=0; i<intro_viewer.dataSources.length; i++){

                    dataSource = intro_viewer.dataSources.get(i);
                    dataSource.entities.values.forEach(function(cv){
                        var building_type = cv.properties._building_;
                        var color =buildingColors[building_type];
                        if(color){
                            cv.polygon.material = Cesium.Color.fromCssColorString(color);
                            cv.polygon.outlineColor = Cesium.Color.fromCssColorString(color);
                            cv.polygon.extrudedHeight = cv.properties.Bldg_Heigh / 3.2;
                        }

                    });
                }
            }else{
                for(i=0; i<intro_viewer.dataSources.length; i++){

                    dataSource = intro_viewer.dataSources.get(i);
                    dataSource.entities.values.forEach(function(cv){
                        cv.polygon.material = Cesium.Color.BURLYWOOD;
                        cv.polygon.outlineColor = Cesium.Color.BURLYWOOD;
                    });
                }
            }
        }
    });

}