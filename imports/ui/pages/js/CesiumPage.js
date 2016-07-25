/**
 * Created by jmartinez on 7/21/16.
 */
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

            var viewer = new Cesium.Viewer('cesiumContainer');
            viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
            viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
            viewer.scene.screenSpaceCameraController.inertiaZoom = 0;

            viewer.camera.moveStart.addEventListener(function() {
                // the camera started to move
            });
            viewer.camera.moveEnd.addEventListener(function() {
                var rect = viewer.camera.computeViewRectangle();
                var boxArray = [];
                boxArray.push([convert(rect.west), convert(rect.south)]); //southwest
                boxArray.push([convert(rect.west), convert(rect.north)]); //northwest
                boxArray.push([convert(rect.east), convert(rect.north)]); //northeast
                boxArray.push([convert(rect.east), convert(rect.south)]); //southeast
                boxArray.push([convert(rect.west), convert(rect.south)]); //southwest
                console.log(boxArray);

                Meteor.subscribe('buildings_poly_selection', boxArray, {
                    onReady: function(){
                        var ids = buildings.find({}).fetch();
                        console.log(ids);
                        //this.stop();
                        // Meteor.call('findBuildings', ids, function(error, response){
                        //     var source = new Cesium.GeoJsonDataSource("buildings");
                        //     viewer.dataSources.removeAll(true);
                        //     viewer.dataSources.add(source);
                        //     source.load({
                        //         type: "FeatureCollection",
                        //         crs: {
                        //             type: "name",
                        //             properties: {
                        //                 name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                        //             }
                        //         },
                        //         features: response
                        //     });
                        //     var entities = source.entities.values;
                        //     for(var i =0; i<entities.length; i++) {
                        //         var entity = entities[i];
                        //         entity.polygon.extrudedHeight = entity.properties.Bldg_Heigh / 3.2;
                        //         entity.polygon.material = Cesium.Color.BURLYWOOD;
                        //         entity.polygon.outlineColor = Cesium.Color.BURLYWOOD;
                        //     }
                        // });
                    }
                });

                function convert(val){
                    return val * (180/Math.PI);
                }

            });
            
        });

    })
}