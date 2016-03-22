/**
 * Created by jmartinez on 2/16/2016.
 */
if(Meteor.isClient){

    Template.webMap.helpers({
        fields: function(){
            return fields.find({}).fetch();
        },
        years: function() {
            return [2015,2020,2025,2030,2035,2040]
        }, measures: function(){
            return Session.get("selectedData");
        }, formattedValue: function(val, measure){
            if(measure != 'zone_id'){
                var format = d3.format("0,000");
                return format(val);
            }else{
                return val;
            }
        }, measureNameMap: function(abv){
            var measureNames = {
                zone_id: "Zone ID",
                hh_base: "Base Year Households",
                pop_base:"Base Year Population",
                median_income_base: "Base Year Median Income",
                ru_base: "Base Year Residential Unit Count",
                emp_base:"Base Year Employment(All)",
                emp1_base: "Base Year Education Employment",
                emp2_base: "Base Year Entertainment Employment",
                emp3_base: "Base Year Production Employment",
                emp4_base: "Base Year Restaurant Employment",
                emp5_base: "Base Year Retail Employment",
                emp6_base: "Base Year Services Employment",
                nr_base: "Base Year Non-Res SqFt",
                hh_sim: "Sim Year Households",
                pop_sim: "Sim Year Population",
                median_income_sim: "Sim Year Median Income",
                ru_sim: "Sim Year Residential Unit Count",
                emp_sim: "Sim Year Employment(All)",
                emp1_sim: "Sim Year Education Employment",
                emp2_sim: "Sim Year Entertainment Employment",
                emp3_sim: "Sim Year Production Employment",
                emp4_sim: "Sim Year Restaurant Employment",
                emp5_sim: "Sim Year Retail Employment",
                emp6_sim: "Sim Year Services Employment",
                nr_sim: "Sim Year Non-Res SqFt",
                hh_diff: "Diff Year Households",
                pop_diff: "Diff Year Population",
                median_income_diff: "Diff Year Median Income",
                ru_diff: "Diff Year Residential Unit Count",
                emp_diff: "Diff Year Employment(All)",
                emp1_diff: "Diff Year Education Employment",
                emp2_diff: "Diff Year Entertainment Employment",
                emp3_diff: "Diff Year Production Employment",
                emp4_diff: "Diff Year Restaurant Employment",
                emp5_diff: "Diff Year Retail Employment",
                emp6_diff: "Diff Year Services Employment",
                nr_diff: "Diff Year Non-Res SqFt",
                res_price_base: "Base Year Residential Price",
                non_res_price_base: "Base Year Non-Res Price",
                res_price_sim: "Sim Year Residential Price",
                non_res_price_sim: "Sim Year Non-Res Price",
                res_price_diff: "Diff Year Residential Price",
                non_res_price_diff: "Diff Year Non-Res Price",
                sim_density_zone: "Sim Year Zonal Density",
                building_count: "Sim Year Building Count",
                base_year_building_count: "Base Year Building Count"
            };
            return measureNames[abv];
        }, isBase: function(abv){
            var measureAbv = abv.split('_');
            var lastSplitItem = measureAbv[measureAbv.length - 1];
            if(lastSplitItem == 'base'){return true;}else{return false;}
        }, isSim: function(abv){
            var measureAbv = abv.split('_');
            var lastSplitItem = measureAbv[measureAbv.length - 1];
            if(lastSplitItem == 'sim'){return true;}else{return false;}
        }, isDiff: function(abv){
            var measureAbv = abv.split('_');
            var lastSplitItem = measureAbv[measureAbv.length - 1];
            if(lastSplitItem == 'diff'){return true;}else{return false;}
        }, hasSelectedZone: function(){
            return Session.hasOwnProperty('selectedZone');
        }, selectedZone: function(){
            return Session.get('selectedZone');
        }, isSpinning: function(){
            return Session.get('spinning');
        }


    });

    Template.webMap.events({
        "click .zones": function(event, template){
            var thisElement = event.target;
            d3.selectAll(".zones").classed("selected", function(d){
                return (d.properties['zone_str'] === thisElement.id) ? true : false
            });
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
        }, "click .linkMeasure": function(event, template){
            event.preventDefault();
            Session.set('spinning', true);
            var year = parseInt($('#yearSelect').val());
            var measure = event.target.id;
            d3.select(event.target.parentNode.parentNode).classed("active", function(){
                return !($(event.target.parentNode.parentNode).hasClass("active"));
            });
            Meteor.subscribe("zones_by_year", year, {
                onReady: function(){
                    Session.set('spinning', false);
                    var fieldObj = {};
                    fieldObj[measure] = 1;
                    fieldObj['zone_id'] = 1;
                    var data = zoneData.find({sim_year: year}, {fields:fieldObj}).fetch();
                    var max = _.max(data, function(x){return x[measure]})[measure];
                    var quantize = d3.scale.quantize()
                        .domain([0,max])
                        .range(d3.range(7).map(function(i){return "q" + i + "-7";}));
                    var color = d3.scale.linear()
                        .domain([0,max])
                        .range(["#eff3ff", "#084594"]);

                    var feature = d3.selectAll('.zones');
                    //feature.style('fill', function(d){
                    //    var val = _.find(data, function(x){return x['zone_id'] == d.properties['ZONE_ID']})[measure];
                    //    return color(val);
                    //})
                    feature.attr("class", function(d){
                        var val = _.find(data, function(x){return x['zone_id'] == d.properties['ZONE_ID']})[measure];
                        try{
                            return quantize(val) + " zones";
                        }catch(e){
                            return "empty";
                        }
                    })


                }
            });
        }
    });

    Template.webMap.onRendered(function(){
        Session.set('spinning', false);
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