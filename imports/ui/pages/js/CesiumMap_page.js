/**
 * Created by jmartinez on 8/4/16.
 */
if(Meteor.isClient){
    Template.CesiumMap_page.onRendered(function(){
        $.getScript('/scripts/Cesium-1.23/Build/CesiumUnminified/Cesium.js', function(){
            var west = -105.5347;
            var south = 39.2663;
            var east = -104.4301;
            var north = 40.246;
            Session.set('spinning', false);
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

        })
    })
}