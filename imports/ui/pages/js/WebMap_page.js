/**
 * Created by jmartinez on 4/5/16.
 */
import {drawMap} from '../../../startup/client/mapFunctions.js';
import {colorMap} from '../../../startup/client/mapFunctions.js';
import {drawChart} from '../../../startup/client/mapFunctions.js';
import {getDataFields} from '../../../ui/components/Global_helpers.js';

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


    var zoneSubscription = subscribeToZone(year, selectedZoneArray);
}

export function subscribeToZone(year, selectedZoneArray){
    return Meteor.subscribe('grouped_zones', year, selectedZoneArray, {
        onReady: function(){
            var fieldObj = getDataFields(Roles.userIsInRole(Meteor.userId(), ['admin']));
            var data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
            var baseData = zoneData.find({sim_year: 2010, zone_id:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
            this.stop();
            var dataArr =[];

            //functional programming way of creating the right data object
            if(data.length > 0){
                dataArr = _.keys(data[0]).map(function(key){
                    var value = data.reduce(function(a, b){
                        var obj = {};
                        obj[key] = a[key] + b[key];
                        return obj
                    });

                    var baseValue = baseData.reduce(function(a, b){
                        var obj = {};
                        obj[key] = a[key] + b[key];
                        return obj
                    });

                    return {measure: key, value:parseInt(value[key]), diff: parseInt(value[key]) - parseInt(baseValue[key])};
                });
            }



            //imperative programming way of creating the right data object

            // for(var prop in data[0]){
            //     if(data[0].hasOwnProperty(prop)){
            //         var obj = {};
            //         obj["measure"] = prop;
            //         obj["value"] = 0;
            //         for(var i=0; i< data.length; i++){
            //             var val = parseInt(data[i][prop]) || 0;
            //             obj["value"] += val;
            //         }
            //         dataArr.push(obj);
            //     }
            // }

            var dataDict = {};
            var chartData;



            dataDict["oneYear"] = _.sortBy(dataArr, 'measure').reverse();
            var allYears = _.groupBy(zoneData.find().fetch(), 'sim_year');
            var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');

            if(Session.get('selectedZone').length > 0){
                chartData = _.keys(allYears).map(function(key){
                    var simData = allYears[key].reduce(function(a,b){
                        return {
                            pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                            emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                            sim_year: a.sim_year
                        };
                    });
                    return simData;
                });
            }else{
                chartData = _.keys(counties).map(function(key){
                    var simData = counties[key].reduce(function(a,b){
                        return {
                            pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                            emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                            sim_year: a.sim_year
                        };
                    });
                    return simData;
                });
            }



            dataDict["allYears"] = chartData;
            Session.set("selectedData", dataDict);


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
    
    zoneComments = undefined;
    Template.WebMap_page.events({
        "click .zones": function(event, template) {
            Session.set('zoneClicked', true);
            var thisElement = event.target;
            var year = parseInt($('#yearSelectZone').val());
            findZoneData(thisElement.id, year);
            if(zoneComments){
                zoneComments.stop();
                zoneComments = Meteor.subscribe("commentsByZone", thisElement.id)
            }else{
                zoneComments = Meteor.subscribe("commentsByZone", thisElement.id)
            }


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
            d3.select(".mapSvg").remove();
            d3.selectAll(".zones").remove();
            d3.selectAll(".counties").remove();
            var countyParams = {
                pathString: "data/county_web.json",
                obj_name: "county_2014_web",
                label_string: "County: ",
                geo_property: "COUNTY",
                geo_class: "counties"
            };
            drawMap(countyParams);
            drawMap({
                pathString: "data/municipalities.json",
                obj_name: "drcog_municipalities",
                label_string: "City: ",
                geo_property: "CITY",
                geo_class: "city"
            });


            var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');
            var regionalChartData = _.keys(counties).map(function(key){
                var simData = counties[key].reduce(function(a,b){
                    return {
                        pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                        emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                        sim_year: a.sim_year
                    };
                });
                return simData;
            });

            drawChart(regionalChartData);
        }, "click #zoneResults-li": function(event, template){
            event.preventDefault();
            d3.select(".mapSvg").remove();
            d3.selectAll(".zones").remove();
            d3.selectAll(".counties").remove();
            var zoneParams = {
                pathString: "data/zonesGeo.json",
                obj_name: "zones",
                label_string: "ZoneId: ",
                geo_property: "ZONE_ID",
                tazId: "TAZ_ID",
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
                var streets = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                    attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: 'abcd',
                    id: 'mapbox.outdoors',
                    accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                });
                map.addLayer(streets);
            }else{
                map.eachLayer(function(layer){
                    map.removeLayer(layer);
                });
                var imagery = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                    attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: 'abcd',
                    id: 'mapbox.streets-satellite',
                    accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                });
                map.addLayer(imagery);
            }
        }, "click #toggleCharts": function(event, template){
            event.preventDefault();
            var toggle = template.chartToggle.get();
            toggle = !toggle;
            template.chartToggle.set(toggle);

            var htmlHeight = $(window).height();
            var navHeight = $('.homeNav').height();
            var mapHeight = htmlHeight - navHeight;
            var el = document.getElementById('chartsContainer');
            var bounds = el.getBoundingClientRect();
            var containerHeight = bounds.bottom - bounds.top;
            var newTop = mapHeight - containerHeight;

            console.log(bounds);

            newTop = newTop.toString() + 'px';

            if(toggle){
                $('#chartsContainer').animate({'top': newTop}, 500);
            }else{
                $('#chartsContainer').animate({'top': '100%'}, 500);
            }


        }, "click .buildings": function(event, template){
            console.log(this.id);
            Meteor.subscribe('selected_building', this.id, {
                onReady: function(){
                    console.log(urbansim_buildings.findOne({plan_id: this.id}));
                }
            })
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

    Template.WebMap_page.onCreated(function(){
        this.chartToggle = new ReactiveVar(false);
    })

}

