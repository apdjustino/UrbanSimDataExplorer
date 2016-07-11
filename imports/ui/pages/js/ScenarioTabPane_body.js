/**
 * Created by jmartinez on 7/7/2016.
 */
if(Meteor.isClient){
    
    Template.ScenarioTabPane_body.onCreated(function(){

    });
    
    Template.ScenarioTabPane_body.helpers({
        
    });

    Template.ScenarioTabPane_body.events({
        "change #chkDrawTool": function(event, template){
            var checked = event.target.checked;
            defineMouseEvents(checked);

        }, "click #clearSelection": function(event, template){
            event.preventDefault();
            d3.selectAll('.selectionLine').remove();
            var checked = $('#chkDrawTool').prop("checked");
            defineMouseEvents(checked);
        }
    });

    function defineMouseEvents(checked){
        var line;
        var coordinates =[];
        var counter = 0;
        var g = d3.select('.leaflet-zoom-hide');
        if(checked){
            d3.select('#mapContainer').style("cursor", "default");
            g.on("mousedown", function(){
                counter = counter + 1;
                var mouse = d3.mouse(this);
                coordinates.push({x: mouse[0], y:mouse[1]});

                line = g.append('line')
                    .attr("id", "line-" + counter.toString())
                    .attr("class", "selectionLine")
                    .attr("x1", mouse[0])
                    .attr("y1", mouse[1])
                    .attr("x2", mouse[0])
                    .attr("y2", mouse[1])
                    .style("stroke", "black")
                    .style("stroke-width", 2);
                g.on("mousemove", function(){
                    var mouse = d3.mouse(this);
                    line.attr("x2", mouse[0])
                        .attr("y2", mouse[1]);
                });
            }).on("dblclick", function(){
                var mouse = d3.mouse(this);
                var x2 = d3.select('#line-1').attr("x1");
                var y2 = d3.select('#line-1').attr("y1");
                line = g.append('line')
                    .attr("id", "closing-line")
                    .attr("class", "selectionLine")
                    .attr("x1", mouse[0])
                    .attr("y1", mouse[1])
                    .attr("x2", x2)
                    .attr("y2", y2)
                    .style("stroke", "black")
                    .style("stroke-width", 2);
                g.on("mousemove", function(){});
                var latLngs = coordinates.map(function(coord){
                    var point = L.point(coord.x, coord.y);
                    var latLng = map.layerPointToLatLng(point);
                    return [latLng.lng, latLng.lat];
                });

                latLngs.pop();
                latLngs.push(latLngs[0]);

                console.log(latLngs);

                var sub = Meteor.subscribe('parcels_poly_selection', latLngs, {
                    onReady: function(){
                        var ids = parcels_centroids.find({}).fetch().map(function(x){ return x.properties.parcel_id});
                        Meteor.call('findParcels', ids, function(error, response){
                            console.log(response);
                            d3.selectAll('.parcels')
                                .transition().duration(250)
                                .style("fill", function(d){
                                    if(d.properties.parcel_id == response.properties.parcel_id){
                                        return "blue"
                                    }
                                });
                        });
                    }
                });
                
                g.on("mousedown", function(){}).on("dblclick", function(){});


            });
        }else{
            d3.select('#mapContainer').style("cursor", "");
            g.on("mousedown", function(){}).on("mousemove", function(){}).on("dblclick", function(){});
        }
    }
}