/**
 * Created by jmartinez on 2/16/2016.
 */
if(Meteor.isClient){

    Template.webMap.helpers({
        fields: function(){
            return fields.find({}).fetch();
        },
        years: function() {
            return [2015,2016,2017]
        }, testOptions: function(){
            if(GoogleMaps.loaded()){
                return{
                    center: new google.maps.LatLng(39.9281049, -105.0209591),
                    zoom:8,
                    mapTypeId: google.maps.MapTypeId.HYBRID
                };
            }
        }


    });

    Template.webMap.rendered = function(){
        var cdnUrl = [
            'http://cesiumjs.org/releases/1.18/Build/CesiumUnminified/Cesium.js'
        ];

        cdnUrl.forEach(function(cv, index){
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', cv);
            document.getElementsByTagName('head')[0].appendChild(script);
            script.onload = function(){
                var viewer = new Cesium.Viewer('cesiumContainer');
            }
        });
    }
}



