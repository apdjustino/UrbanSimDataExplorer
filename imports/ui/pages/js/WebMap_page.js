/**
 * Created by jmartinez on 4/5/16.
 */
import {drawMap} from '../../../startup/client/mapFunctions.js';
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
            if(year === 2010){year = 2015;}
            var data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields:{zone_id:0, _id:0, sim_year:0}}).fetch();
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

            Session.set("selectedData", _.sortBy(dataArr, 'measure').reverse());
            this.stop();
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
                {paneName: 'County', paneId: 'countyResults', paneBody: 'CountyTabPane_body', paneData:{}}
            ]
        }, selectedZone: function(){
            return Session.get('selectedZone');
        }
    });
    
    Template.WebMap_page.events({
        "click .zones": function(event, template){
            var thisElement = event.target;
            var year = parseInt($('#yearSelect').val());
            findZoneData(thisElement.id, year);


        }, "change #yearSelect": function(event, template){
            var selectedZoneArray = Session.get('selectedZone');
            //Session.set('selectedZone', zone_id);
            var year = parseInt($('#yearSelect').val());

            var zoneSubscription = Meteor.subscribe('grouped_zones', year, selectedZoneArray, {
                onReady: function(){
                    if(year === 2010){year = 2015;}
                    var data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields:{zone_id:0, _id:0, sim_year:0}}).fetch();
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

                    Session.set("selectedData", _.sortBy(dataArr, 'measure').reverse());
                    this.stop();
                }
            });
        }, "click .linkMeasure": function(event, template) {
            event.preventDefault();
            Session.set('spinning', true);
            var year = parseInt($('#yearSelect').val());
            var measure = event.target.id;
            if(year == 2010){year = 2015;}
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
                    var max = _.max(data, function (x) {
                        return x[measure]
                    })[measure];
                    var quantize = d3.scale.quantize()
                        .domain([0, max])
                        .range(d3.range(7).map(function (i) {
                            return "q" + i + "-7";
                        }));
                    var color = d3.scale.linear()
                        .domain([0, max])
                        .range(["#eff3ff", "#084594"]);

                    var feature = d3.selectAll('.zones');
                    //feature.style('fill', function(d){
                    //    var val = _.find(data, function(x){return x['zone_id'] == d.properties['ZONE_ID']})[measure];
                    //    return color(val);
                    //})
                    feature.attr("class", function (d) {
                        var val = _.find(data, function (x) {
                            return x['zone_id'] == d.properties['ZONE_ID']
                        })[measure];
                        try {
                            return quantize(val) + " zones";
                        } catch (e) {
                            return "empty";
                        }
                    });
                    this.stop();
                }
            });
        }, "click #btnReset":function(event, template) {
            event.preventDefault();
            Session.set('selectedZone', []);
            Session.set('selectedData', undefined);
            d3.selectAll(".zones").attr("class", "zones");
        }, "click #countyResults-li": function(event, template){
            event.preventDefault();
            d3.selectAll("path").remove();
            var countyParams = {
                pathString: "data/county_web.json",
                obj_name: "county_2014_web",
                label_string: "County: ",
                geo_property: "COUNTY",
                geo_class: "zones"
            };

            drawMap(countyParams);
        }, "click #zoneResults-li": function(event, template){
            event.preventDefault();
            var zoneParams = {
                pathString: "data/zonesGeo.json",
                obj_name: "zones",
                label_string: "ZoneId: ",
                geo_property: "ZONE_ID",
                geo_class: "zones"
            };
            Session.set('spinning', true);
            drawMap(zoneParams);
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

