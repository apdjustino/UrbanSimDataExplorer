/**
 * Created by jmartinez on 7/21/16.
 */
import {findZoneData} from '../js/WebMap_page.js';
if(Meteor.isClient){
    Template.CesiumPage.onRendered(function(){
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
                name: "Mapbox Streets",
                iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/mapboxStreets.png'),
                tooltip: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                creationFunction: function(){
                    return new Cesium.MapboxImageryProvider({
                        mapId: 'mapbox.outdoors',
                        accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                    })
                }
            }));

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


            var viewer = new Cesium.Viewer('cesiumContainer', {
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



            viewer.baseLayerPicker.viewModel.imageryProviderViewModels = imageryViewModels;
            viewer.baseLayerPicker.viewModel.terrainProviderViewModels = [];
            viewer.selectedImageryProviderViewModel = imageryViewModels[0];



            viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
            viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
            viewer.scene.screenSpaceCameraController.inertiaZoom = 0;

            
            var promise = Cesium.GeoJsonDataSource.load("/data/zonesGeo.json", {
                stroke: Cesium.Color.BLACK,
                fill: new Cesium.Color(0.01,0.01,0.01,0.01)
            });
            promise.then(function(dataSource){
                viewer.dataSources.add(dataSource)
            }).otherwise(function(error){
                //Display any errrors encountered while loading.
                window.alert(error);
            });
            
            drawEntities();


            //event handlers

            viewer.camera.moveStart.addEventListener(function() {

            });
            viewer.camera.moveEnd.addEventListener(function() {
                drawEntities();
            });
            
            var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            handler.setInputAction(function(click){
                var pickedObject = viewer.scene.pick(click.position);
                var entity = pickedObject.id;
                var zoneId = entity.properties.ZONE_ID;

                var ds = viewer.dataSources.get(0);
                var selectedZones = Session.get('selectedZone');
                if(Session.equals('allowMultipleGeo', false)){
                    if(selectedZones.length > 0){
                        var prior = _.find(ds.entities.values, function(entity){return entity.properties.ZONE_ID == selectedZones[0]});
                        prior.polygon.material = new Cesium.Color(0.01,0.01,0.01,0.01);

                    }
                    entity.polygon.material = new Cesium.Color(1,1,0,0.5);
                }else{
                    if(_.contains(selectedZones, zoneId)){
                        entity.polygon.material = new Cesium.Color(0.01,0.01,0.01,0.01);
                    }else{
                        entity.polygon.material = new Cesium.Color(1,1,0,0.5);
                    }

                }


                findZoneData(zoneId, 2040)
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // var counter = 0;
            // var lat;
            // var long;
            // var originLat;
            // var originLong;
            // var scenario = true;
            //
            // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            // handler.setInputAction(function(click){
            //     if(scenario){
            //         counter = counter + 1;
            //         var cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
            //         if(cartesian){
            //             var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //             long = Cesium.Math.toDegrees(cartographic.longitude);
            //             lat = Cesium.Math.toDegrees(cartographic. latitude);
            //             if(counter == 1){
            //                 originLong = Cesium.Math.toDegrees(cartographic.longitude);
            //                 originLat = Cesium.Math.toDegrees(cartographic. latitude);
            //             }
            //         }
            //         viewer.entities.add({
            //             id: counter,
            //             polyline: {
            //                 positions: Cesium.Cartesian3.fromDegreesArray([long, lat, long, lat]),
            //                 width: 2,
            //                 material: Cesium.Color.RED
            //             }
            //
            //
            //         });
            //     }
            //
            // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            //
            // handler.setInputAction(function(movement){
            //     if(scenario){
            //         var line = viewer.entities.getById(counter);
            //         // line.positions = Cesium.Cartesian.fromDegreesArray([long, lat])
            //         var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            //         if(cartesian){
            //             var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //             newLong = Cesium.Math.toDegrees(cartographic.longitude);
            //             newLat = Cesium.Math.toDegrees(cartographic. latitude);
            //
            //         }
            //
            //         line.polyline.positions = Cesium.Cartesian3.fromDegreesArray([long, lat, newLong, newLat ])
            //     }
            //
            // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            //
            // handler.setInputAction(function(dblClick){
            //     if(scenario){
            //         counter = counter + 1;
            //         var cartesian = viewer.camera.pickEllipsoid(dblClick.position, viewer.scene.globe.ellipsoid);
            //         if(cartesian){
            //             var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //             newlong = Cesium.Math.toDegrees(cartographic.longitude);
            //             newLat = Cesium.Math.toDegrees(cartographic. latitude);
            //         }
            //
            //         viewer.entities.add({
            //             id: counter,
            //             polyline: {
            //                 positions: Cesium.Cartesian3.fromDegreesArray([newLong, newLat, originLong, originLat]),
            //                 width: 2,
            //                 material: Cesium.Color.RED
            //             }
            //         });
            //         scenario = false;
            //     }
            //
            // }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);


            function drawEntities() {

                var position = viewer.camera.positionCartographic;
                var pitch = viewer.camera.pitch;
                var heading = viewer.camera.heading;

                console.log(position);
                console.log(pitch);
                console.log(heading);

                if(position.height < 701){
                    if(pitch < Cesium.Math.toRadians(-35)){
                        Session.set('spinning', true);
                        var rect = viewer.camera.computeViewRectangle();
                        var boxArray = [];
                        boxArray.push([convert(rect.west), convert(rect.south)]); //southwest
                        boxArray.push([convert(rect.west), convert(rect.north)]); //northwest
                        boxArray.push([convert(rect.east), convert(rect.north)]); //northeast
                        boxArray.push([convert(rect.east), convert(rect.south)]); //southeast
                        boxArray.push([convert(rect.west), convert(rect.south)]); //southwest

                        Meteor.subscribe('buildings_poly_selection', boxArray, {
                            onReady: function(){
                                var ids = buildings_centroids.find({}).fetch().map(function(x){return x.properties.Building_I});
                                this.stop();
                                Meteor.call('findBuildings', ids, function(error, response){
                                    var source = new Cesium.GeoJsonDataSource("buildings");
                                    viewer.dataSources.remove(viewer.dataSources.get(1), true);
                                    viewer.dataSources.add(source);
                                    source.load({
                                        type: "FeatureCollection",
                                        crs: {
                                            type: "name",
                                            properties: {
                                                name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                                            }
                                        },
                                        features: response
                                    });
                                    var entities = source.entities.values;
                                    for(var i =0; i<entities.length; i++) {
                                        var entity = entities[i];
                                        entity.polygon.extrudedHeight = entity.properties.Bldg_Heigh / 3.2;
                                        entity.polygon.material = Cesium.Color.BURLYWOOD;
                                        entity.polygon.outlineColor = Cesium.Color.BURLYWOOD;
                                    }
                                    Session.set('spinning', false);
                                });
                            }
                        });

                        function convert(val){
                            return val * (180/Math.PI);
                        }
                    }

                }
            }

        });

    })
}