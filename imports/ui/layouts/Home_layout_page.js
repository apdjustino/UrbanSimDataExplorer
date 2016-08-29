/**
 * Created by jmartinez on 4/6/16.
 */

import {getNavObject} from '../components/Global_helpers.js';

if(Meteor.isClient){
    
    Template.Home_layout_page.events({
        "click #navLogOut": function(event, template){
            Object.keys(Session.keys).forEach(function(key){
                Session.set(key, undefined);
            });
            Meteor.logout();
        }, "click .toggle": function(event, template){
            event.preventDefault();
            // $('#mapContainer').toggleClass('col-sm-8 col-lg-8 col-sm-12 col-lg-12');
            // $('a.toggle span').toggleClass('glyphicon-chevron-left glyphicon-chevron-right');
            var cesiumWidth = $('#cesiumContainer').width();
            if(width < 1440){
               d3.select('#cesiumContainer').style('width', '100vh')
            }else{
                d3.select('#cesiumContainer').style('width', '100%');
            }
            $('#sidebar').toggle();
        }
    });
    
    Template.Home_layout_page.helpers({
        user: function(){
            if(Meteor.userId()){
                if(!Roles.userIsInRole(Meteor.userId(), ['admin'])){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }, public: function() {
            if(!Meteor.userId()){
                return true;
            }else{
                return false;
            }
        }
    });


    
    
    Template.adminNavBar.onRendered(function(){
        $(".dropdown-button").dropdown({
            constrain_width: false
        });

        $('.navLink').sideNav({
            menuWidth: 420,
            edge: 'right',
            closeOnClick: true
        });
    });
    
    Template.userNavBar.onRendered(function(){
        $('.navLink').sideNav({
            menuWidth: 420,
            edge: 'right',
            closeOnClick: true
        });
    });
    
    Template.publicNavBar.onRendered(function(){
        $('.navLink').sideNav({
            menuWidth: 420,
            edge: 'right',
            closeOnClick: true
        });
    })

    
}