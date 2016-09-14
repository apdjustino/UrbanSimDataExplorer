/**
 * Created by jmartinez on 9/7/16.
 */
import {addSource} from '../../components/CesiumMapFunctions.js';

if(Meteor.isClient){

    Template.Intro_page.onRendered(function(){
        var template = this;
        $.getScript('/scripts/Cesium-1.23/Build/CesiumUnminified/Cesium.js', function(){
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
                    var newSource = new Cesium.GeoJsonDataSource('newBuildings');

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

                    intro_viewer.dataSources.add(source);
                    intro_viewer.dataSources.add(newSource);

                    var z = 0;
                    var cv = response[z];
                    transition(cv);


                }
            });

        });
    });

    Template.Intro_page.onCreated(function(){
        this.currentUc = new ReactiveVar(undefined);
        this.newBuildings = new ReactiveVar('');
        this.currentYear = new ReactiveVar(2010);
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
    })

}