/**
 * Created by jmartinez on 8/15/16.
 */
if(Meteor.isClient){
    Template.Material_collapsible.onRendered(function(){
        $('.collapsible').collapsible();
    });
    

}