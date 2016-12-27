/**
 * Created by jmartinez on 8/15/16.
 */
if(Meteor.isClient){
    Template.Material_collapsible.onRendered(function(){
        $('.collapsible').collapsible();
    });

    Template.Material_collapsible.events({
        "click .collapsible-header": function(event, template){
            if(event.target.id == "RegionalForecastPane"){
                Session.set('selectedData', undefined);
                Session.set('selectedZone', []);
            }
        }
    })

}