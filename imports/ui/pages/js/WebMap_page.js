/**
 * Created by jmartinez on 4/5/16.
 */
import topojson from 'topojson';


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
                {paneName: 'Zone', paneId: 'zoneResults', paneBody: 'ZoneTabPane_body', paneData:{selectedAreas:selectedAreas, selectedData:selectedData}}
            ]
        }, selectedZone: function(){
            return Session.get('selectedZone');
        }
    });
    
    Template.WebMap_page.events({
        "click .zones": function(event, template){
            var thisElement = event.target;
            var selectedZoneArray = Session.get('selectedZone');
            if($.inArray(parseInt(thisElement.id), selectedZoneArray) !== -1){
                selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == thisElement.id;}));
            }else{
                if(Session.get('allowMultipleGeo') == false){
                    selectedZoneArray = [parseInt(thisElement.id)];
                }else{
                    selectedZoneArray.push(parseInt(thisElement.id));
                }

            }

            d3.selectAll(".zones").classed("selected", function(d){
                return ($.inArray(d.properties['ZONE_ID'], selectedZoneArray) !== -1);
            });
            Session.set('selectedZone', selectedZoneArray);
            var zone_id = parseInt(event.target.id);
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
            d3.selectAll(".zones").classed("selected", false);
        }
    });

    Template.WebMap_page.onRendered(function(){
        Session.set('spinning', false);
        Session.set('selectedYear', 2015);
        Session.set('selectedZone', []);
        Session.set('allowMultipleGeo', false);
        $('#myTab li').first().addClass('active');
        $('.tab-pane').first().addClass('active');
        
        L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

        var map = L.map("mapContainer").setView([39.75, -104.95], 10);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        //initiate d3 variables
        var drawZones = true;
        var centered;
        var mapById = d3.map();
        var svg = d3.select(map.getPanes().overlayPane).append("svg");
        var g = svg.append("g").attr("class", "leaflet-zoom-hide");
        var feature;
        var quantize = d3.scale.quantize()
            .range(d3.range(7).map(function(i){return "q" + i + "-7";}));

        //functional map variable
        var mapById = d3.map();

        //d3 "loop" that adds topojson to map
        function drawMap(zones){
            var pathString;
            var obj_name;
            var label_string;
            var geo_property;
            var geo_class;
            if(zones){
                pathString = "data/zonesGeo.json";
                obj_name="zones";
                label_string = "ZoneId: ";
                geo_property = "ZONE_ID";
                geo_class = "zones";

            }
            else{
                pathString = "data/county_web.json";
                obj_name="county_2014_web";
                label_string = "County: ";
                geo_property = "COUNTY";
                geo_class = "counties";
            }
            d3.json(pathString, function(zones){
                //console.log(zones);
                var shape = topojson.feature(zones, zones.objects[obj_name]);
                var transform = d3.geo.transform({point: projectPoint});
                var path = d3.geo.path().projection(transform);


                feature = g.selectAll("path")
                    .data(shape.features)
                    .enter()
                    .append("path")
                    .attr("class", geo_class)
                    .attr("id", function(d){return d.properties['ZONE_ID'];});
                var title = feature.append("svg:title")
                    .attr("class", "pathTitle")
                    .text(function(d){return label_string + d.properties[geo_property];});



                //var feature = g.selectAll("path")
                //    .data(shape.features)
                //    .enter()
                //    .append("path")
                //    .attr("class", "q0-7 zones");

                map.on("viewreset", reset);
                reset();

                function reset(){
                    var bounds = path.bounds(shape),
                        topLeft = bounds[0],
                        bottomRight = bounds[1];

                    width = bottomRight[0] - topLeft[0];
                    height = bottomRight[1] - topLeft[1];

                    svg
                        .attr("width", bottomRight[0] - topLeft[0])
                        .attr("height", bottomRight[1] - topLeft[1])
                        .style("left", topLeft[0] + "px")
                        .style("top", topLeft[1] + "px");

                    g
                        .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

                    feature.attr("d", path);




                }

                function projectPoint(x, y){
                    var point = map.latLngToLayerPoint(new L.LatLng(y,x));
                    this.stream.point(point.x, point.y);
                }

                function inverseProjectPoint(x, y){
                    var point = map.layerPointToLatLng([y,x]);
                    return point;
                }




            });
        }

        drawMap(drawZones);

    });
}