/**
 * Created by jmartinez on 4/5/16.
 */
import { measureNameMap } from '../../ui/components/Global_helpers.js';

if(Meteor.isClient){
    
    Template.Result_table.helpers({
        tableData: function(){
            return Session.get('selectedData');
        }, CommentModal_args: function(measure){
            var selectedYear = parseInt($('#yearSelect option:selected').val());
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
        }
    })
    
}