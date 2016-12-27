/**
 * Created by jmartinez on 8/15/16.
 */
if(Meteor.isClient){

    Template.OptionsControl_body.helpers({
       
    });

    Template.OptionsControl_body.events({
        "click #chkMultiple": function(event, template){
            if(event.target.checked){
                Session.set('allowMultipleGeo', true);
            }else{
                Session.set('allowMultipleGeo', false);
            }
        }, "click #btnReset": function(event,template){
            event.preventDefault();
            var mapName = FlowRouter.getRouteName();
            Session.set('colorData', undefined);
            Session.set('selectedData', undefined);
            Session.set('selectedZone', []);

            if(mapName == 'webMap'){
                d3.selectAll('.entity')
                    .attr("class", "entity")
                    .style("fill", "rgba(0,0,0,0)");

                $('#showCommentZones').prop('checked', false);
            }else{
                var ds = viewer.dataSources.get(0);
                var entities = ds.entities.values;
                entities.forEach(function(cv){
                    cv.polygon.material = new Cesium.Color(0.01,0.01,0.01,0.01);
                    cv.polygon.extrudedHeight = 0;
                });

                for(var i = viewer.dataSources.length - 1; i>0; i--){
                    viewer.dataSources.remove(viewer.dataSources.get(i));
                }

                viewer.entities.removeAll();
                $('#showCommentZones').prop('checked', false);
            }

        }, "click #showCommentZones": function(event, template){
            var mapName = FlowRouter.getRouteName();
            if(event.target.checked){
                if(mapName == 'webMap'){
                    Meteor.call("getCommentZones", function(error, result){
                        if(error){
                            sAlert.error(error.reason);
                        }else{
                            d3.selectAll('.entity').transition().duration(500)
                                .style("fill", function(d){
                                    if(_.contains(result, d.properties.ZONE_ID)){
                                        return "red"
                                    }
                                });
                        }
                    });
                }else{
                    Meteor.call("getCommentZones", function(error, result){
                        if(error){
                            sAlert.error(error.reason);
                        }else{
                            var ds = viewer.dataSources.get(0);
                            var entities = ds.entities.values;
                            entities.forEach(function(cv){
                                if(_.contains(result, cv.properties.ZONE_ID)){
                                    viewer.entities.add({
                                        polygon: {
                                            hierarchy: cv.polygon.hierarchy,
                                            material: new Cesium.Color(1,0,0, .7)
                                        }
                                    });
                                }
                            })
                        }
                    });



                }
            }else{
                if(mapName == 'webMap'){
                    d3.selectAll(".entity").transition().duration(500)
                        .style("fill", "");
                }else{
                    debugger;
                    viewer.entities.removeAll();
                }
            }
        }, "click #showBuildings": function(event, target){
            Session.set('showBuildings', event.target.checked);
        }
    })



}