/**
 * Created by jmartinez on 7/21/16.
 */
if(Meteor.isClient){
    Template.CesiumPage.onRendered(function(){
        $.getScript('/scripts/Cesium-1.23/Build/CesiumUnminified/Cesium.js', function(){
            var viewer = new Cesium.Viewer('cesiumContainer');
        });

    })
}