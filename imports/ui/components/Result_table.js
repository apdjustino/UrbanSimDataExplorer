/**
 * Created by jmartinez on 4/5/16.
 */
import { measureNameMap } from '../../ui/components/Global_helpers.js';
import '../../ui/pages/html/CommentModal_body.html';
import '../../ui/pages/js/CommentModal_body.js';

if(Meteor.isClient){

    Template.Result_table.onRendered(function(){
        $('.modal-trigger').leanModal();
    });
<<<<<<< HEAD
    
=======

>>>>>>> b018a3f5d43585de45050ba9a0b60e4f45cef8fd
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
            if(selectedZones){
                if(selectedZones.length > 1){
                    return false;
                }else{
                    return true
                }
            }

        }, commentCount: function(measure){
            var year = Session.get('selectedYear');
            var zone = Session.get('selectedZone')[0];
            var id = zone + '-' + measure + '-' + year;
            return Comments.getCollection().find({referenceId: id}).count();
        }
    });

    commentSub = undefined;
    Template.Result_table.events({
        'click .commentLink': function(){
            $('#commentModal').openModal();
            var measure = this.measure;
            Session.set('commentMeasure', measure);
            var year = Session.get('selectedYear');
            var zone = Session.get('selectedZone')[0];
            var id = zone + '-' + measure + '-' + year;
            console.log(id);
            if(commentSub){
                commentSub.stop();
                commentSub = Meteor.subscribe('commentById', id)
            }else{
                commentSub = Meteor.subscribe('commentById', id)
            }
        }
    })


}