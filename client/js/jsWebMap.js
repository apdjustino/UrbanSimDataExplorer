/**
 * Created by jmartinez on 2/16/2016.
 */
if(Meteor.isClient){

    Template.webMap.helpers({
        fields: function(){
            return fields.find({}).fetch();
        },
        years: function() {
            return [2010,2015,2020,2025,2030,2035,2040]
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
                hh_base: "Households",
                pop_base:"Population",
                median_income_base: "Median Income",
                ru_base: "Residential Unit Count",
                emp_base:"Employment(All)",
                emp1_base: "Education Employment",
                emp2_base: "Entertainment Employment",
                emp3_base: "Production Employment",
                emp4_base: "Restaurant Employment",
                emp5_base: "Retail Employment",
                emp6_base: "Services Employment",
                nr_base: "Non-Res SqFt",
                hh_sim: "Households",
                pop_sim: "Population",
                median_income_sim: "Median Income",
                ru_sim: "Residential Unit Count",
                emp_sim: "Employment(All)",
                emp1_sim: "Education Employment",
                emp2_sim: "Entertainment Employment",
                emp3_sim: "Production Employment",
                emp4_sim: "Restaurant Employment",
                emp5_sim: "Retail Employment",
                emp6_sim: "Services Employment",
                nr_sim: "Non-Res SqFt",
                hh_diff: "Households",
                pop_diff: "Population",
                median_income_diff: "Median Income",
                ru_diff: "Residential Unit Count",
                emp_diff: "Employment(All)",
                emp1_diff: "Education Employment",
                emp2_diff: "Entertainment Employment",
                emp3_diff: "Production Employment",
                emp4_diff: "Restaurant Employment",
                emp5_diff: "Retail Employment",
                emp6_diff: "Services Employment",
                nr_diff: "Non-Res SqFt",
                res_price_base: "Residential Price",
                non_res_price_base: "Non-Res Price",
                res_price_sim: "Residential Price",
                non_res_price_sim: "Non-Res Price",
                res_price_diff: "Residential Price",
                non_res_price_diff: "Non-Res Price",
                sim_density_zone: "Zonal Density",
                building_count: "Building Count",
                base_year_building_count: "Building Count"
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
            var selectedZoneArray = Session.get('selectedZone');
            if($.inArray(parseInt(thisElement.id), selectedZoneArray) !== -1){
                selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == thisElement.id;}));
            }else{
                selectedZoneArray.push(parseInt(thisElement.id));
            }

            d3.selectAll(".zones").classed("selected", function(d){
                return ($.inArray(d.properties['ZONE_ID'], selectedZoneArray) !== -1);
            });
            Session.set('selectedZone', selectedZoneArray);
            var zone_id = parseInt(event.target.id);
            //Session.set('selectedZone', zone_id);
            var year = parseInt($('#yearSelect').val());
            var baseYearFields = {
                _id: 0,
                hh_base: 1,
                pop_base:1,
                median_income_base: 1,
                ru_base: 1,
                emp_base:1,
                emp1_base: 1,
                emp2_base: 1,
                emp3_base: 1,
                emp4_base: 1,
                emp5_base: 1,
                emp6_base: 1,
                nr_base: 1,
                res_price_base: 1,
                non_res_price_base: 1

            };
            var simYearFields = {
                _id: 0,
                hh_sim: 1,
                pop_sim: 1,
                median_income_sim: 1,
                ru_sim: 1,
                emp_sim: 1,
                emp1_sim: 1,
                emp2_sim: 1,
                emp3_sim: 1,
                emp4_sim: 1,
                emp5_sim: 1,
                emp6_sim: 1,
                nr_sim: 1,
                res_price_sim: 1,
                non_res_price_sim: 1
            };
            var diffYearFields = {
                _id: 0,
                hh_diff: 1,
                pop_diff: 1,
                median_income_diff: 1,
                ru_diff: 1,
                emp_diff: 1,
                emp1_diff: 1,
                emp2_diff: 1,
                emp3_diff: 1,
                emp4_diff: 1,
                emp5_diff: 1,
                emp6_diff: 1,
                nr_diff: 1,
                res_price_diff: 1,
                non_res_price_diff: 1
            };
            var fields = {};
            if(year == 2010){fields = baseYearFields; year = 2015;}else{fields = simYearFields}
            Meteor.subscribe('grouped_zones', year, selectedZoneArray, {
                onReady: function(){

                    var data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields: fields}).fetch();
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
                }
            });



        },"change #yearSelect": function(event, template){
            var baseYearFields = {
                _id: 0,
                hh_base: 1,
                pop_base:1,
                median_income_base: 1,
                ru_base: 1,
                emp_base:1,
                emp1_base: 1,
                emp2_base: 1,
                emp3_base: 1,
                emp4_base: 1,
                emp5_base: 1,
                emp6_base: 1,
                nr_base: 1,
                res_price_base: 1,
                non_res_price_base: 1

            };
            var simYearFields = {
                _id: 0,
                hh_sim: 1,
                pop_sim: 1,
                median_income_sim: 1,
                ru_sim: 1,
                emp_sim: 1,
                emp1_sim: 1,
                emp2_sim: 1,
                emp3_sim: 1,
                emp4_sim: 1,
                emp5_sim: 1,
                emp6_sim: 1,
                nr_sim: 1,
                res_price_sim: 1,
                non_res_price_sim: 1
            };
            var diffYearFields = {
                _id: 0,
                hh_diff: 1,
                pop_diff: 1,
                median_income_diff: 1,
                ru_diff: 1,
                emp_diff: 1,
                emp1_diff: 1,
                emp2_diff: 1,
                emp3_diff: 1,
                emp4_diff: 1,
                emp5_diff: 1,
                emp6_diff: 1,
                nr_diff: 1,
                res_price_diff: 1,
                non_res_price_diff: 1
            };
            var year = parseInt($(event.target).val());
            var fields = {};
            if(year == 2010){fields = baseYearFields; year = 2015;}else{fields = simYearFields}
            var selectedZoneArray = Session.get('selectedZone');
            Meteor.subscribe('grouped_zones', year, selectedZoneArray, {
                onReady: function(){

                    var data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields: fields}).fetch();
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
        }, "click #btnReset":function(event, template){
            event.preventDefault();
            Session.set('selectedZone', []);
            Session.set('selectedData', undefined);
            d3.selectAll(".zones").classed("selected", false);
        }
    });

    Template.webMap.onRendered(function(){
        Session.set('spinning', false);
        Session.set('selectedYear', 2015);
        Session.set('selectedZone', []);
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