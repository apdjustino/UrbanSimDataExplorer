/**
 * Created by jmartinez on 4/5/16.
 */

import { findZoneData } from '../js/WebMap_page';
import {subscribeToZone} from '../js/WebMap_page';
import {drawMap} from '../../../startup/client/mapFunctions.js';
import {colorMap} from '../../../startup/client/mapFunctions.js';

if(Meteor.isClient){


    Template.ZoneTabPane_body.helpers({
        selectedAreas: function() {
            return Session.get('selectedZone');
        }, admin_variables: function(){
            return [
                {abv: 'hh_sim', abv_base: 'hh_base'},
                {abv: 'pop_sim', abv_base: 'pop_base'},
                {abv: 'median_income_sim', abv_base: 'median_income_base'},
                {abv: 'ru_sim', abv_base: 'ru_base'},
                {abv: 'emp_sim', abv_base: 'emp_base'},
                {abv: 'emp1_sim', abv_base: 'emp1_base'},
                {abv: 'emp2_sim', abv_base: 'emp2_base'},
                {abv: 'emp3_sim', abv_base: 'emp3_base'},
                {abv: 'emp4_sim', abv_base: 'emp4_base'},
                {abv: 'emp5_sim', abv_base: 'emp5_base'},
                {abv: 'emp6_sim', abv_base: 'emp6_base'},
                {abv: 'nr_sim', abv_base: 'nr_base'},
                {abv: 'res_price_sim', abv_base: 'res_price_base'},
                {abv: 'non_res_price_sim', abv_base: 'non_res_price_base'}
            ];

        }, public_variables: function(){
            return [
                {abv: 'hh_sim', abv_base: 'hh_base'},
                {abv: 'pop_sim', abv_base: 'pop_base'},
                {abv: 'emp_sim', abv_base: 'emp_base'}
            ];
        }, isBaseYear: function(){
            return Session.get('isBaseYear');
        }, zoneClicked: function(){
            return Session.get('zoneClicked');
        }, selectedVariable: function(){
            return Session.get('selectedVariable');
        }, zoneResults: function(){
            return Session.get('zoneResults');
        }
    });

    Template.ZoneTabPane_body.events({
        "change #chkMultiple": function(event, template){
            event.preventDefault();
            Session.set('allowMultipleGeo', event.target.checked);
        }, "submit #findAZone": function(event){
            event.preventDefault();
            Session.set('zoneClicked', true);
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
                    var year = parseInt($('#yearSelectZone').val());
                    findZoneData(zoneId, year);
                }else{
                    sAlert.error('Zone not Found', {position:'bottom'});
                }

            }

        }, "change #yearSelectZone": function(event, template){
            var selectedZoneArray = Session.get('selectedZone');
            //Session.set('selectedZone', zone_id);
            var year = parseInt($('#yearSelectZone').val());


            var zoneSubscription = subscribeToZone(year, selectedZoneArray);

        }, "click #btnZoneQuery": function(event, template){
            event.preventDefault();
            var selectedYear = parseInt($('#yearSelectZone option:selected').val());
            var selectedVar = $('#variableSelectZone option:selected').val();
            Session.set('selectedVariable', selectedVar);
            Session.set('spinning', true);
            Meteor.subscribe("zones_by_year", selectedYear, selectedVar, {
                onReady: function () {
                    Session.set('spinning', false);
                    var fieldObj = {};
                    fieldObj[selectedVar] = 1;
                    fieldObj['zone_id'] = 1;
                    var data = zoneData.find({sim_year: selectedYear}, {fields: fieldObj}).fetch();
                    if($('#queryDiffs').prop('checked')){
                        var baseData = zoneData.find({sim_year: 2010}, {fields: fieldObj}).fetch();
                        var mappedData = data.map(function(row, idx){
                            
                            var rowData = row;
                            rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                            console.log(rowData);
                            return rowData
                        });
                        console.log(mappedData);
                    }
                    colorMap(data, selectedVar, 'zone');
                    this.stop();
                }
            });

        }, "click .showLegend": function(event){
            if(!event.target.checked){
                $('#legendList').animate({'left':'88%'}, 1000)
            }else {
                $('#legendList').animate({'left':'44%'}, 1000)
            }

        }, "change #showCommentZones": function(event, template){
            if(event.target.checked){
                Meteor.call("getCommentZones", function(error, result){
                    if(error){
                        sAlert.error(error.reason);
                    }else{
                        d3.selectAll('.zones').transition().duration(500)
                            .style("fill", function(d){
                                if(_.contains(result, d.properties.ZONE_ID)){
                                    return "red"
                                }
                            });
                    }
                });
            }else{
                d3.selectAll(".zones").transition().duration(500)
                    .style("fill", "");
            }
        }

    });

    map = undefined;
    Template.ZoneTabPane_body.onRendered(function(){
        Session.set('isBaseYear', true);
        Session.set('zoneResults', undefined);
        Session.set('queryReturn', false);
        Session.set('selectedVariable', undefined);
        
        var geoSubscription = Meteor.subscribe('zoneGeoData');
        L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

        map = L.map("mapContainer").setView([39.75, -104.95], 10);
        var streets = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            id: 'mapbox.outdoors',
            accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
        });

        map.addLayer(streets);


        
        
        var zoneParams = {
            pathString: "/data/zonesGeo.json",
            obj_name: "zones",
            label_string: "ZoneId: ",
            geo_property: "ZONE_ID",
            tazId: "TAZ_ID",
            geo_class: "zones"
        };

        drawMap({
            pathString: "/data/municipalities.json",
            obj_name: "drcog_municipalities",
            label_string: "City: ",
            geo_property: "CITY",
            geo_class: "city"
        });
        drawMap(zoneParams);

    })

}