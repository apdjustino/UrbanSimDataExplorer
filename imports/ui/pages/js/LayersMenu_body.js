/**
 * Created by jmartinez on 8/4/16.
 */
if(Meteor.isClient){

    Template.LayersMenu_body.events({
        "click .layerBtn": function(event, template){
            event.preventDefault();
            Session.set('spinning', true);
            Session.set('selectedLayer', event.target.id);
            var path = "/data/" + event.target.id + ".json";
            if(viewer){
                viewer.dataSources.removeAll(true);
                var promise = Cesium.GeoJsonDataSource.load(path, {
                    stroke: Cesium.Color.BLACK,
                    fill: new Cesium.Color(0.01,0.01,0.01,0.01)
                });
                promise.then(function(dataSource){
                    Session.set('spinning', false);
                    viewer.dataSources.add(dataSource);
                }).otherwise(function(error){
                    //Display any errrors encountered while loading.
                    window.alert(error);
                });
            }else{
                alert("Cesium Viewer error");
            }
        }
    })

}