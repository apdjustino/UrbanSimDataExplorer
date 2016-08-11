/**
 * Created by jmartinez on 8/11/16.
 */
import {subscribeToZone} from '../../components/CesiumMapFunctions.js';
if(Meteor.isClient){
    
    Template.InfoModal_header.onRendered(function(){
        $('select').material_select();
    });

    Template.InfoModal_header.events({
        "click .yearOption": function(event, template){
            event.preventDefault();
            var year = parseInt(event.target.id);
            var zone = Session.get('selectedZone');
            Session.set('selectedYear', year);
            $('.yearOption').each(function(index){
                $(this).removeClass('green')
            });
            var selector = '#' + year;
            $(selector).addClass('green');
            subscribeToZone(year, zone);
        }
    });

    Template.InfoModal_header.helpers({
        selectedYear: function(){
            return Session.get('selectedYear');
        }
    });

    Template.InfoModal_header.onCreated(function(){
        Session.set('selectedYear', 2010);
    })


    
}