/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){
    
    Template.Result_table.helpers({
        tableData: function(){
            return Session.get('selectedData');
        }
    })
    
}