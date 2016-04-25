/**
 * Created by jmartinez on 4/6/16.
 */
if(Meteor.isClient){
    
    Template.Home_layout_page.events({
        "click #logOutUserNav": function(event, template){
            event.preventDefault();
            Object.keys(Session.keys).forEach(function(key){
                Session.set(key, undefined);
            });
            Meteor.logout();
        }, "click .toggle": function(event, template){
            event.preventDefault();
            $('#mapContainer').toggleClass('col-sm-8 col-lg-8 col-sm-12 col-lg-12');
            $('a.toggle span').toggleClass('glyphicon-chevron-left glyphicon-chevron-right');
            $('#sidebar').toggle();
        }
    })
    
}