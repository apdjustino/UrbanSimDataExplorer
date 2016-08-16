/**
 * Created by jmartinez on 8/15/16.
 */
if(Meteor.isClient){

    Template.OptionsControl_body.events({
        "change #chkMultiple": function(){
            if(event.target.checked){
                Session.set('allowMultipleGeo', true);
            }else{
                Session.set('allowMultipleGeo', false);
            }
        }, "click #btnReset": function(event,template){
            event.preventDefault();
            Session.set('colorData', undefined);
            Session.set('selectedData', undefined);
            var ds = viewer.dataSources.get(0);
            var entities = ds.entities.values;
            entities.forEach(function(cv){
                cv.polygon.material = new Cesium.Color(0.01,0.01,0.01,0.01);
                cv.polygon.extrudedHeight = 0;
            });
        }
    })

}