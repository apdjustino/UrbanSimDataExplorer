/**
 * Created by jmartinez on 5/2/16.
 */

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

export function drawChart(data){
    d3.selectAll(".svgChart").remove();
    var margin = {top: 10, right:25, bottom:25, left:90},
        width = 350 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom;
    
    var x = d3.scale.linear().range([0, width]);
    var y_pop = d3.scale.linear().range([height, 0]);
    var y_emp = d3.scale.linear().range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.format('d'));
    
    var yAxis = d3.svg.axis()
        .scale(y_pop)
        .orient("left");

    var yAxis_emp = d3.svg.axis()
        .scale(y_emp)
        .orient("left");
    
    var line_pop = d3.svg.line()
        .x(function(d){return x(d.sim_year)})
        .y(function(d){return y_pop(d.pop_sim)});

    var line_emp = d3.svg.line()
        .x(function(d){return x(d.sim_year)})
        .y(function(d){return y_emp(d.emp_sim)});


    var svg = d3.select("#popChartContainer").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .attr("class", "svgChart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg_emp = d3.select("#hhChartContainer").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .attr("class", "svgChart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    x.domain([2010, 2040]);
    y_pop.domain(d3.extent(data, function(d){return d.pop_sim}));
    y_emp.domain(d3.extent(data, function(d){return d.emp_sim}));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Population");

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line_pop);

    svg_emp.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg_emp.append("g")
        .attr("class", "y axis")
        .call(yAxis_emp)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Employment");

    svg_emp.append("path")
        .datum(data)
        .attr("class", "lineEmp")
        .attr("d", line_emp)

    
}

