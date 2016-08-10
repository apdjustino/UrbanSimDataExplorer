/**
 * Created by jmartinez on 8/8/16.
 */
if(Meteor.isClient){

    Template.Material_select.onRendered(function() {
        Tracker.afterFlush(function(){
            $('select').material_select();
        });

    });

}