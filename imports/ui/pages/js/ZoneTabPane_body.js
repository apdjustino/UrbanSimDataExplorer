/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){

    Template.ZoneTabPane_body.helpers({
        ResultTable_args: function(selectedData){
            const tableData = selectedData;
            return {
                tableData: tableData
            };
        }
    });

    Template.ZoneTabPane_body.events({
        "change #chkMultiple": function(event, template){
            event.preventDefault();
            Session.set('allowMultipleGeo', event.target.checked);
        }
    })

}