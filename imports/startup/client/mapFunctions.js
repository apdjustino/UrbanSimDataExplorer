/**
 * Created by jmartinez on 5/2/16.
 */
import topojson from 'topojson';

export function drawMap(params){
    
    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    d3.json(params.pathString, function(zones){
        //console.log(zones);
        var shape = topojson.feature(zones, zones.objects[params.obj_name]);
        var transform = d3.geo.transform({point: projectPoint});
        var path = d3.geo.path().projection(transform);


        feature = g.selectAll("path")
            .data(shape.features)
            .enter()
            .append("path")
            .attr("class", params.geo_class)
            .attr("id", function(d){return d.properties['ZONE_ID'];});
        var title = feature.append("svg:title")
            .attr("class", "pathTitle")
            .text(function(d){return params.label_string + d.properties[params.geo_property];});
        

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

        Session.set('spinning', false);

    

    });
}