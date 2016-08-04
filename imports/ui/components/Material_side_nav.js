/**
 * Created by jmartinez on 8/3/16.
 */
if(Meteor.isClient){
    
    Template.Material_side_nav.onRendered(function(){
        $('.navLink').sideNav({
            menuWidth: 420,
            edge: 'right'
        });
    });

    Template.Material_side_nav.events({
        "click #closeSideNav": function(event, template){
            $('.navLink').sideNav('hide');
        }
    })
    
}