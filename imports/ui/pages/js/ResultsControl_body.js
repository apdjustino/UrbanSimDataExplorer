/**
 * Created by jmartinez on 8/15/16.
 */
import {subscribeToZone} from '../../components/CesiumMapFunctions.js';
if(Meteor.isClient){
    
    Template.ResultsControl_body.helpers({
        hasData: function(data){
            if(data == undefined || data.oneYear.length == 0){
                return false;
            }else{
                return true;
            }
        }, selectedData: function(){
            return Session.get('selectedData');
        }, selectedYear: function(){
            return Session.get('selectedYear');
        }, YearSelect_args: function(){
            return {
                multiple: "",
                selectId: "yearSelect",
                selectData: [
                    {value: 2010, name: 2010},
                    {value: 2015, name: 2015},
                    {value: 2020, name: 2020},
                    {value: 2025, name: 2025},
                    {value: 2030, name: 2030},
                    {value: 2035, name: 2035},
                    {value: 2040, name: 2040}

                ], label: "Year"
            }
        }
    });

    Template.ResultsControl_body.events({
        "change #yearSelect": function(event, template){
            event.preventDefault();
            var year = parseInt(event.target.value);
            var zone = Session.get('selectedZone');
            subscribeToZone(year, zone);
        }
    });
    
    
}