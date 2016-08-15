/**
 * Created by jmartinez on 8/10/16.
 */
import {findZoneData} from '../../components/CesiumMapFunctions.js';
if(Meteor.isClient){
    
    Template.FindZoneControl_body.events({
        "submit #findAZone": function(event, template){
            event.preventDefault();
            var zoneId = $('#zoneSearch').val();
            Meteor.call("getZoneCentroid", zoneId, function(error, response){
                if(error){
                    sAlert.error(error.response, {position:"bottom"});
                }else{
                    $('.navLink').sideNav('hide');
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(response[0], response[1], 4000),
                        duration: 4,
                        complete: function(){
                            
                            findZoneData(parseInt(zoneId), 2040);
                            $('#infoModal').openModal();
                        }
                    });
                }
            })
        }
    })
    
}