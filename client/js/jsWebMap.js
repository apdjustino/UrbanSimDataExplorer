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
        }, measures: function(){
            return Session.get("selectedData");
        }, formattedValue: function(val){
            if(val != 'zone_id')
            var format = d3.format("0,000");
            return format(val);
        }


    });

    Template.webMap.events({
        "click .zones": function(event, template){

            var zone_id = parseInt(event.target.id);
            Session.set('selectedZone', zone_id);
            var year = parseInt($('#yearSelect').val());
            Meteor.subscribe('individual_zone', year, zone_id, {
                onReady: function(){
                    var data = zoneData.findOne({sim_year: year, zone_id:zone_id});
                    var dataArr =[];

                    for(var prop in data){
                        if(prop !='_id' && prop !='sim_year'){
                            if(data.hasOwnProperty(prop)){
                                var obj = {};
                                obj["measure"] = prop;
                                obj["value"] = data[prop];
                                dataArr.push(obj);
                            }
                        }

                    }

                    Session.set("selectedData", dataArr);
                }
            });



        },"change #yearSelect": function(event, template){
            var year = parseInt($(event.target).val());
            var zone_id  = Session.get('selectedZone');
            Meteor.subscribe('individual_zone', year, zone_id, {
                onReady: function(){
                    var data = zoneData.findOne({sim_year: year, zone_id:zone_id});
                    var dataArr =[];

                    for(var prop in data){
                        if(prop !='_id' && prop !='sim_year'){
                            if(data.hasOwnProperty(prop)){
                                var obj = {};
                                obj["measure"] = prop;
                                obj["value"] = data[prop];
                                dataArr.push(obj);
                            }
                        }

                    }

                    Session.set("selectedData", dataArr);
                }
            });



        }
    });

    Template.webMap.onRendered(function(){
        Meteor.subscribe("zones_by_year", 2015);
        Session.set('selectedYear', 2015);
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