/**
 * Created by jmartinez on 4/5/16.
 */
import {drawMap} from '../../../startup/client/mapFunctions.js';
import {colorMap} from '../../../startup/client/mapFunctions.js';
import {drawChart} from '../../../startup/client/mapFunctions.js';

export function findZoneData(zoneId, year){
    var selectedZoneArray = Session.get('selectedZone');
    if($.inArray(parseInt(zoneId), selectedZoneArray) !== -1){
        selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == zoneId;}));
    }else{
        if(Session.get('allowMultipleGeo') == false){
            selectedZoneArray = [parseInt(zoneId)];
        }else{
            selectedZoneArray.push(parseInt(zoneId));
        }

    }

    d3.selectAll(".zones").classed("selected", function(d){
        return ($.inArray(d.properties['ZONE_ID'], selectedZoneArray) !== -1);
    });
    Session.set('selectedZone', selectedZoneArray);


    var zoneSubscription = Meteor.subscribe('grouped_zones', year, selectedZoneArray, {
        onReady: function(){
            var data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields:{zone_id:0, _id:0, sim_year:0}}).fetch();
            this.stop();
            var dataArr =[];

            //first sum results in array

            for(var prop in data[0]){
                if(data[0].hasOwnProperty(prop)){
                    var obj = {};
                    obj["measure"] = prop;
                    obj["value"] = 0;
                    for(var i=0; i< data.length; i++){
                        var val = parseInt(data[i][prop]) || 0;
                        obj["value"] += val;
                    }
                    dataArr.push(obj);
                }

            }
            var dataDict = {};
            var chartData = [];
            dataDict["oneYear"] = _.sortBy(dataArr, 'measure').reverse();
            var allYears = _.groupBy(zoneData.find().fetch(), 'sim_year');
            for(var property in allYears){
                if(allYears.hasOwnProperty(property)){
                    var sim_data = allYears[property].reduce(function(a, b){
                        return {
                            pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                            emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                            sim_year: a.sim_year
                        };
                    });
                    chartData.push(sim_data);

                }
            }
            console.log(chartData);
            dataDict["allYears"] = chartData;
            Session.set("selectedData", dataDict.oneYear);
            drawChart(dataDict.allYears);

        }
    });
}
if(Meteor.isClient){
    
    Template.WebMap_page.helpers({
        selectedData: function(){
            return Session.get('selectedData');
        }, selectedAreas: function(){
            return Session.get('selectedZone');
        }, isSpinning: function(){
            return Session.get('spinning');
        }, TabPane_args: function(tabPane){
            return {
                paneId: tabPane.paneId,
                paneBody: tabPane.paneBody,
                paneData: tabPane.paneData
            };
        }, TabPanes: function(selectedAreas, selectedData){
            return [
                {paneName: 'Zone', paneId: 'zoneResults', paneBody: 'ZoneTabPane_body', paneData:{selectedAreas:selectedAreas, selectedData:selectedData}},
                {paneName: 'County', paneId: 'countyResults', paneBody: 'CountyTabPane_body', paneData:{}},
                {paneName: 'Layers', paneId: 'layers', paneBody: 'LayersTabPane_body', paneData:{}},
                {paneName: 'Downloads', paneId: 'downloads', paneBody:'DownloadsTabPane_body', paneData:{}}
            ]
        }, selectedZone: function(){
            return Session.get('selectedZone');
        }
    });
    
    Template.WebMap_page.events({
        "click .zones": function(event, template) {
            Session.set('zoneClicked', true);
            var thisElement = event.target;
            var year = parseInt($('#yearSelectZone').val());
            findZoneData(thisElement.id, year);


        }, "click .linkMeasure": function(event, template) {
            event.preventDefault();
            Session.set('spinning', true);
            var year = parseInt($('#yearSelect').val());
            var measure = event.target.id;
            d3.select(event.target.parentNode.parentNode).classed("active", function () {
                return !($(event.target.parentNode.parentNode).hasClass("active"));
            });
            Meteor.subscribe("zones_by_year", year, measure, {
                onReady: function () {
                    Session.set('spinning', false);
                    var fieldObj = {};
                    fieldObj[measure] = 1;
                    fieldObj['zone_id'] = 1;
                    var data = zoneData.find({sim_year: year}, {fields: fieldObj}).fetch();
                    colorMap(data, measure, 'zone');
                    this.stop();
                }
            });
        }, "click #btnReset":function(event, template) {
            event.preventDefault();
            Session.set('selectedZone', []);
            Session.set('selectedData', undefined);
            Session.set('zoneClicked', false);
            d3.selectAll(".zones").attr("class", "zones");
            d3.selectAll(".city").classed("citySelected", false);
            d3.selectAll(".svgChart").remove();
            $('.muniChk').attr('checked', false);
        }, "click #countyResults-li": function(event, template){
            event.preventDefault();
            d3.selectAll(".zones").remove();
            var countyParams = {
                pathString: "data/county_web.json",
                obj_name: "county_2014_web",
                label_string: "County: ",
                geo_property: "COUNTY",
                geo_class: "zones"
            };
            drawMap({
                pathString: "data/municipalities.json",
                obj_name: "drcog_municipalities",
                label_string: "City: ",
                geo_property: "CITY",
                geo_class: "city"
            });
            drawMap(countyParams);
        }, "click #zoneResults-li": function(event, template){
            event.preventDefault();
            d3.selectAll(".zones").remove();
            var zoneParams = {
                pathString: "data/zonesGeo.json",
                obj_name: "zones",
                label_string: "ZoneId: ",
                geo_property: "ZONE_ID",
                geo_class: "zones"
            };
            Session.set('spinning', true);
            drawMap({
                pathString: "data/municipalities.json",
                obj_name: "drcog_municipalities",
                label_string: "City: ",
                geo_property: "CITY",
                geo_class: "city"
            });
            drawMap(zoneParams);

        },  "click #downloads-li": function(event){
            event.preventDefault();
        }, "click .tileRadio": function(event){
            var val = event.target.value;
            if(val === 'street'){
                map.eachLayer(function(layer){
                    map.removeLayer(layer);
                });
                var streets = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                map.addLayer(streets);
            }else{
                map.eachLayer(function(layer){
                    map.removeLayer(layer);
                });
                var imagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
                map.addLayer(imagery);
            }
        }, "click #toggleCharts": function(event){
            event.preventDefault();
            var el = document.getElementById('chartsContainer');
            var bounds = el.getBoundingClientRect();
            console.log(bounds.top);
            var windowSize = .66 * $(window).height();
            console.log(windowSize);
            if(bounds.top < windowSize){
                $('#chartsContainer').animate({'top':'93vh'}, 500);
            }else{
                $($('#chartsContainer').animate({'top': '56vh'}, 500));
            }

        }

    });


    Template.WebMap_page.onRendered(function(){
        Session.set('spinning', false);
        Session.set('selectedYear', 2015);
        Session.set('selectedZone', []);
        Session.set('allowMultipleGeo', false);
        $('#myTab li').first().addClass('active');
        $('.tab-pane').first().addClass('active');



    });

}

