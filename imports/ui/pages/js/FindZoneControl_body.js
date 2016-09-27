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
            var mapName = FlowRouter.getRouteName();
            var zoneId = $('#zoneSearch').val();
            if(mapName == 'webMap'){
                // var selector = '#id-' + zoneId;
                // console.log(d3.select(selector).datum(function(d){console.log(d)}))
                d3.selectAll('.entity').attr("class", function(d){
                    if(d.properties.ZONE_ID == zoneId){
                        var lat = d.properties.Lat;
                        var long = d.properties.Long;
                        map.setView(new L.LatLng(lat, long), 13, {animate:true});
                        findZoneData(zoneId, Session.get('selectedYear'));
                        return "entity selected"
                    }else{
                        return "entity"
                    }

                });
            }else{
                var ds = viewer.dataSources.get(0);

                var entity = _.find(ds.entities.values, function(x){return x.properties.zone_str == zoneId});
                if(entity){
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(entity.properties.Long, entity.properties.Lat, 4000),
                        duration: 4,
                        complete: function(){
                            viewer.entities.add({
                                polygon: {
                                    hierarchy: entity.polygon.hierarchy,
                                    material: new Cesium.Color(1,1,0,1, .7)
                                }
                            });
                            findZoneData(zoneId, Session.get('selectedYear'));
                        }
                    });

                }else{
                    Materialize.toast("Zone: " + zoneId + " not found.", 4000);
                }
            }


            
        }
    })
    
}