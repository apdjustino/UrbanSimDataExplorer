/**
 * Created by jmartinez on 5/2/16.
 */
import topojson from 'topojson';

export function drawMap(params){
    
    var svg = d3.select("svg");
    var g = d3.select(".leaflet-zoom-hide");



    d3.json(params.pathString, function(error, zones){
        if(error){
            console.log(error);
            return;
        }
        
        var shape = topojson.feature(zones, zones.objects[params.obj_name]);
        var transform = d3.geo.transform({point: projectPoint});
        var path = d3.geo.path().projection(transform);


        feature = g.selectAll(params.geo_property)
            .data(shape.features)
            .enter()
            .append("path")
            .attr("class", params.geo_class)
            .attr("id", function(d){return d.properties[params.geo_property];});
        var title = feature.append("svg:title")
            .attr("class", "pathTitle")
            .text(function(d){
                if(params.hasOwnProperty('tazId')){
                    return params.label_string + d.properties[params.geo_property] + ', TAZ_ID: ' + d.properties[params.tazId];
                }else{
                    return params.label_string + d.properties[params.geo_property];
                }

            });
        

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

            d3.selectAll("." + params.geo_class).attr("d", path);
            // feature.attr("d", path);




        }

        function projectPoint(x, y){
            var point = map.latLngToLayerPoint(new L.LatLng(y,x));
            this.stream.point(point.x, point.y);
        }

        Session.set('spinning', false);

    

    });
}

export function colorMap(data, measure, juris){
    
    var max = _.max(data, function (x) {
        return x[measure]
    })[measure];

    
    var quantize = d3.scale.quantize()
        .domain([0, max])
        .range(d3.range(7).map(function (i) {
            return "q" + i + "-7";
        }));

    var feature = d3.selectAll('.zones');


    feature.attr("class", function (d) {
        var val = _.find(data, function (x) {
            if(juris === 'county'){
                return x['county_name'] == d.properties['COUNTY']
            }else{
                return x['zone_id'] == d.properties['ZONE_ID']
            }            
        })[measure];
        try {
            return quantize(val) + " zones";
        } catch (e) {
            return "empty";
        }
    });

    //draw legend

    var quantizeRange = [];
    d3.range(7).forEach(function(cv){
        quantizeRange.push("q" + cv + "-7");
    });
    var range = [];
    quantizeRange.forEach(function(cv){
        var obj = {};
        obj["cssClass"] = cv;
        obj["range"] = quantize.invertExtent(cv);
        range.push(obj)
    });

    d3.selectAll(".legendItemContainer").remove();
    var legendDiv = d3.select('#legendList');

    var listItems = legendDiv.selectAll("div")
        .data(range)
        .enter()
        .append("div")
        .attr("class", "legendItemContainer row");

    var containers = d3.selectAll(".legendItemContainer");
    containers.append("div").attr("class", "col-xs-3 col-sm-3 col-md-3 col-lg-3 leftCol");
    containers.append("div").attr("class", "col-xs-9 col-sm-9 col-md-9 col-lg-9 rightCol");

    var leftCols = d3.selectAll(".leftCol")
        .append("div")
        .attr("class", function(d){
            return d.cssClass + " legendItem"
        });

    var rightCols = d3.selectAll(".rightCol")
        .append("h5")
        .attr("class","text-center")
        .text(function(d){
            return parseInt(d.range[0]) + ' - ' + parseInt(d.range[1]);
        });


    
}
