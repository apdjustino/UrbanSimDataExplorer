/**
 * Created by jmartinez on 8/10/16.
 */
import {findZoneData} from '../../components/CesiumMapFunctions.js';
if(Meteor.isClient){
    
    Template.FindZoneControl_body.helpers({
        label: function(data){
            var layerMap = {
                zonesGeo: "Zone ID (4-digit)",
                municipalities: "Municipality",
                county_web: "County",
                urban_centers: "Urban Center Name"
            };

            return layerMap[data];
        }
    });
    
    Template.FindZoneControl_body.events({
        "submit #findAZone": function(event, template){

            event.preventDefault();
            var ds = viewer.dataSources.get(0);
            var zoneId = $('#zoneSearch').val();
            var entity = _.find(ds.entities.values, function(x){return x.properties.zone_str == zoneId});
            if(entity){
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(entity.properties.Long, entity.properties.Lat, 4000),
                    duration: 4,
                    complete: function(){
                        findZoneData(zoneId, Session.get('selectedYear'));
                    }
                });

            }else{
                Materialize.toast("Zone: " + zoneId + " not found.", 4000);
            }

            
            
            // Meteor.call("getZoneCentroid", zoneId, function(error, response){
            //     if(error){
            //         sAlert.error(error.response, {position:"bottom"});
            //     }else{
            //         $('.navLink').sideNav('hide');
            //         viewer.camera.flyTo({
            //             destination: Cesium.Cartesian3.fromDegrees(response[0], response[1], 4000),
            //             duration: 4,
            //             complete: function(){
            //
            //                 findZoneData(parseInt(zoneId), 2040);
            //                 $('#infoModal').openModal();
            //             }
            //         });
            //     }
            // })
        }
    })
    
}