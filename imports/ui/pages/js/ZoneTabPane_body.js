/**
 * Created by jmartinez on 4/5/16.
 */

import { findZoneData } from '../js/WebMap_page'
import {drawMap} from '../../../startup/client/mapFunctions.js';
if(Meteor.isClient){


    Template.ZoneTabPane_body.helpers({
        selectedAreas: function() {
            return Session.get('selectedZone');
        }
    });

    Template.ZoneTabPane_body.events({
        "change #chkMultiple": function(event, template){
            event.preventDefault();
            Session.set('allowMultipleGeo', event.target.checked);
        }, "submit #findAZone": function(event){
            event.preventDefault();
            var inputText = $('#zoneSearch').val();
            if(inputText.length === 6){
                var zoneInfo = zoneGeoData.findOne({TAZ_ID: parseInt(inputText)});
                if(zoneInfo){
                    var lat = zoneInfo.Lat;
                    var long = zoneInfo.Long;
                    var zoneId = zoneInfo.ZONE_ID;
                    map.setView(new L.LatLng(lat, long), 13, {animate:true});
                    var year = parseInt($('#yearSelect').val());
                    findZoneData(zoneId, year);
                }else{
                    sAlert.error('Zone not Found', {position:'bottom'});
                }
                
            }else{
                var zoneInfo = zoneGeoData.findOne({ZONE_ID: parseInt(inputText)});
                if(zoneInfo){
                    var lat = zoneInfo.Lat;
                    var long = zoneInfo.Long;
                    var zoneId = zoneInfo.ZONE_ID;
                    map.setView(new L.LatLng(lat, long), 13, {animate:true});
                    var year = parseInt($('#yearSelect').val());
                    findZoneData(zoneId, year);
                }else{
                    sAlert.error('Zone not Found', {position:'bottom'});
                }

            }

        }
    });

    map = undefined;
    Template.ZoneTabPane_body.onRendered(function(){
        var geoSubscription = Meteor.subscribe('zoneGeoData');
        L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

        map = L.map("mapContainer").setView([39.75, -104.95], 10);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


        var zoneParams = {
            pathString: "data/zonesGeo.json",
            obj_name: "zones",
            label_string: "ZoneId: ",
            geo_property: "ZONE_ID",
            geo_class: "zones"
        };

        drawMap(zoneParams);

    })

}