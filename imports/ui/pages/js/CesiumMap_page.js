/**
 * Created by jmartinez on 8/4/16.
 */
import {measureNameMap} from '../../components/Global_helpers.js';
import {setZoneClickEvents} from '../../components/CesiumMapFunctions.js';

if(Meteor.isClient){
    Template.CesiumMap_page.onRendered(function(){
        Session.set('spinning', true);
        Session.set('selectedLayer', 'zonesGeo');
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


            viewer = new Cesium.Viewer('cesiumContainer', {
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


            viewer.dataSources.removeAll(true);
            var promise = Cesium.GeoJsonDataSource.load('/data/zonesGeo.json', {
                stroke: Cesium.Color.BLACK,
                fill: new Cesium.Color(0.01,0.01,0.01,0.01)
            });
            promise.then(function(dataSource){
                viewer.dataSources.add(dataSource);
                Session.set('spinning', false);
            }).otherwise(function(error){
                //Display any errrors encountered while loading.
                window.alert(error);
            });

            setZoneClickEvents();
            

        })
    });

    Template.CesiumMap_page.helpers({
        InfoModal_args: function(){
            return {
                modalId: "infoModal",
                bottom: "bottom-sheet",
                modalHeader: "Zone: " + Session.get("selectedZone"),
                modalHeaderTemplate: "InfoModal_header",
                modalBodyTemplate: "InfoModal_body",
                data: Session.get('selectedData')
            }
        }, CommentModal_args: function(){
            var measure = Session.get('commentMeasure');
            var year = Session.get('selectedYear');
            var zone = Session.get('selectedZone');
            
            return {
                modalId: "commentModal",
                bottom: "",
                modalHeader: year + " " + measureNameMap(measure) + " Comments for Zone(s): " + zone,
                modalHeaderTemplate: "CommentModal_header",
                modalBodyTemplate: "CommentModal_body",
                data: {measure: measure, year: year, zone: zone}
            }
        }
    })
}