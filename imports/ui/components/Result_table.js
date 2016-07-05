/**
 * Created by jmartinez on 4/5/16.
 */
import { measureNameMap } from '../../ui/components/Global_helpers.js';
import '../../ui/pages/html/CommentModal_body.html';
import '../../ui/pages/js/CommentModal_body.js';

if(Meteor.isClient){
    
    Template.Result_table.helpers({
        tableData: function(){
            var data = Session.get('selectedData');
            if (data.hasOwnProperty('oneYear')){
                return Session.get('selectedData').oneYear;
            }
        }, CommentModal_args: function(measure){
            var selectedYear = parseInt($('#yearSelectZone option:selected').val());
            var selectedZones = Session.get('selectedZone');
            return {
                modalId: 'commentModal-' + measure,
                bodyTemplate: 'CommentModal_body',
                modalTitle: selectedYear + ' ' + measureNameMap(measure) + ' Comments for Zone(s): ' + selectedZones,
                modalData: {measure: measure, year: selectedYear, zone:selectedZones}
            }
        }, multiZones: function(){
            var selectedZones = Session.get('selectedZone');
            if(selectedZones.length > 1){
                return false;
            }else{
                return true
            }
        }, commentCount: function(measure){
            var year = parseInt($('#yearSelectZone option:selected').val());
            var zone = Session.get('selectedZone')[0];
            var id = zone + '-' + measure + '-' + year;
            return Comments.getCollection().find({referenceId: id}).count();
        }
    });

    commentSub = undefined;
    Template.Result_table.events({
        'click .commentLink': function(){
            var measure = this.measure;
            var year = parseInt($('#yearSelectZone option:selected').val());
            var zone = Session.get('selectedZone')[0];
            var id = zone + '-' + measure + '-' + year;
            if(commentSub){
                commentSub.stop();
                commentSub = Meteor.subscribe('commentById', id)
            }else{
                commentSub = Meteor.subscribe('commentById', id)
            }
        }
    })

    
}