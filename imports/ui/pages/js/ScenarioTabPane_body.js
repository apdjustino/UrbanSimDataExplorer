/**
 * Created by jmartinez on 7/7/2016.
 */
if(Meteor.isClient){
    
    Template.ScenarioTabPane_body.onCreated(function(){
        this.selection = new ReactiveVar(undefined);
    });
    
    Template.ScenarioTabPane_body.helpers({
        scenarios: function(){
            var currentUserProfile = Meteor.users.findOne({_id: Meteor.userId()}).profile;
            if(currentUserProfile.scenarios){
                return currentUserProfile.scenarios;
            }
        }, selection: function(){
            return Template.instance().selection.get();
        }, selectionCount: function(selection){
            if(selection){
                return selection.length;
            }else{
                return 0;
            }
        }
        
    });

    Template.ScenarioTabPane_body.events({
        "change .chkDrawTool": function(event, template){
            var checked = event.target.checked;
            defineMouseEvents(checked, template);

        }, "click .clearSelection": function(event, template){
            event.preventDefault();
            d3.selectAll('.selectionLine').remove();
            template.selection.set(undefined);
            var checked = $('#chkDrawTool').prop("checked");
            defineMouseEvents(checked ,template);
        }, "submit #newScenario": function(event, template){
            event.preventDefault();
            var scenarioName = $('#newScenarioName').val();
            Meteor.call("addNewScenario", scenarioName, function(error, result){
                if(error){
                    sAlert.error(error.reason, {position: 'bottom'});
                }
            });
            $('#newScenarioName').val("");
        }, "click .removeScenario": function(event, template){
            var scenarioName = event.target.id.split('-')[1];
            Meteor.call("removeScenario", scenarioName, function(error, result){
                if(error){
                    sAlert.error(error.reason, {position: 'bottom'});
                }
            });
        }
    });

    function defineMouseEvents(checked, template){
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

                var sub = Meteor.subscribe('parcels_poly_selection', latLngs, {
                    onReady: function(){
                        var ids = parcels_centroids.find({}).fetch().map(function(x){ return x.properties.parcel_id});

                        this.stop();
                        d3.selectAll('.parcels').transition()
                            .duration(250)
                            .style("fill", function(d){
                                if(_.contains(ids, d.properties.parcel_id)){
                                    return "blue"
                                }
                            });

                        Meteor.call("findParcels", ids, function(error, response){
                            if(error){
                                sAlert.error(error.reason, {position:"bottom"});
                            }else{
                                console.log(response);
                                template.selection.set(response);
                            }
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