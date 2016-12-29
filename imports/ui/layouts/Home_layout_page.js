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