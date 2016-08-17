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
            var selectedYear = Session.get('selectedYear');
            return {
                multiple: "",
                selectId: "yearSelect",
                selectData: [
                    {value: 2010, name: 2010, selected: ((selectedYear == 2010) ? "selected" : "")},
                    {value: 2015, name: 2015, selected: ((selectedYear == 2015) ? "selected" : "")},
                    {value: 2020, name: 2020, selected: ((selectedYear == 2020) ? "selected" : "")},
                    {value: 2025, name: 2025, selected: ((selectedYear == 2025) ? "selected" : "")},
                    {value: 2030, name: 2030, selected: ((selectedYear == 2030) ? "selected" : "")},
                    {value: 2035, name: 2035, selected: ((selectedYear == 2035) ? "selected" : "")},
                    {value: 2040, name: 2040, selected: ((selectedYear == 2040) ? "selected" : "")}

                ], label: "Year"
            }
        }, selectedZone: function(){
            return Session.get('selectedZone');
        }, selectedLayer: function(){
            var layer = Session.get('selectedLayer');
            var layerDict = {
                zonesGeo: "Selected Zone(s): ",
                municipalities: "Selected Cities: ",
                county_web: "Selected Counties: ",
                urban_centers: "Selected Urban Center(s): "
            }
            return layerDict[layer];
        }
    });

    Template.ResultsControl_body.events({
        "change #yearSelect": function(event, template){
            var year = parseInt(event.target.value);
            var zone = Session.get('selectedZone');
            subscribeToZone(year, zone);
        }
    });
    
    
}