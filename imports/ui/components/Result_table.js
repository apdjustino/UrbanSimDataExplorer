/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){
    
    Template.Result_table.helpers({
        tableData: function(){
            return Session.get('selectedData');
        }, CommentModal_args: function(measure){
            var selectedYear = parseInt($('#selectedYear option:selected').val());
            return {
                modalId: 'commentModal-' + measure,
                bodyTemplate: 'CommentModal_body',
                modalTitle: 'Comments',
                modalData: {measure: measure, year: selectedYear}
            }
        }
    })
    
}