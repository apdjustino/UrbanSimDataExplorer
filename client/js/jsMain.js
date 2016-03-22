/**
 * Created by jmartinez on 3/22/2016.
 */
if(Meteor.isClient){

    Template.main.events({
        "click .toggle": function(event, template){
            event.preventDefault();
            $('#mapContainer').toggleClass('col-sm-8 col-lg-8 col-sm-12 col-lg-12');
            $('a.toggle span').toggleClass('glyphicon-chevron-left glyphicon-chevron-right');
            $('#sidebar').toggle();
        }
    })

}