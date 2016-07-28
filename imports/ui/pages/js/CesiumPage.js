/**
 * Created by jmartinez on 7/21/16.
 */
import {findZoneData} from '../js/WebMap_page.js';
if(Meteor.isClient){
    Template.CesiumPage.onRendered(function(){
        $.getScript('/scripts/Cesium-1.23/Build/CesiumUnminified/Cesium.js', function(){
            var west = -105.011794;
            var south = 39.740198;
            var east = -104.9897117;
            var north = 39.759786;

            var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

            Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;

            var viewer = new Cesium.Viewer('cesiumContainer', {
                infoBox: false,
                selectionIndicator: false
            });
            viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
            viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
            viewer.scene.screenSpaceCameraController.inertiaZoom = 0;

            
            var promise = Cesium.GeoJsonDataSource.load("/data/zonesGeo.json", {
                stroke: Cesium.Color.BLACK,
                fill: new Cesium.Color(0.1,0.1,0.1,0.1)
            });
            promise.then(function(dataSource){
                viewer.dataSources.add(dataSource)
            }).otherwise(function(error){
                //Display any errrors encountered while loading.
                window.alert(error);
            });
            
            // viewer.camera.flyTo({
            //     destination : Cesium.Cartesian3.fromRadians(-1.8323722004377674, 0.6937453713039814, 595.3912663897179),
            //     orientation : {
            //         heading : 3.066103356080265,
            //         pitch : Cesium.Math.toRadians(-40.0),
            //         roll : 0.0
            //     },
            //     duration: 5.5,
            //     complete: function(){
            //
            //     }
            // });
            
            drawEntities();

            viewer.camera.moveStart.addEventListener(function() {
                // the camera started to move
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
                        prior.polygon.material = new Cesium.Color(0.1,0.1,0.1,0.1);

                    }
                    entity.polygon.material = new Cesium.Color(1,1,0,0.5);
                }else{
                    if(_.contains(selectedZones, zoneId)){
                        entity.polygon.material = new Cesium.Color(0.1,0.1,0.1,0.1);
                    }else{
                        entity.polygon.material = new Cesium.Color(1,1,0,0.5);
                    }

                }


                findZoneData(zoneId, 2040)
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


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