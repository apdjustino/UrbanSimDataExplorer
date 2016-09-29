/**
 * Created by jmartinez on 8/15/16.
 */
import {subscribeToZone} from '../../components/CesiumMapFunctions.js';
import {subscribeToCity} from '../../components/CesiumMapFunctions.js';
import {subscribeToCounty} from '../../components/CesiumMapFunctions.js';
import {subscribeToUrbanCenter} from '../../components/CesiumMapFunctions.js';
import {addNewBuildings} from '../../components/CesiumMapFunctions.js';
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
            };
            return layerDict[layer];
        }
    });

    Template.ResultsControl_body.events({
        "change #yearSelect": function(event, template){
            var year = parseInt(event.target.value);
            var entity = Session.get('selectedZone');
            Session.set('selectedYear', year);

            //set chloropleth year select to selected year
            var selector = '#queryYearSelect option[value=' + year + ']';
            $(selector).prop('selected', true);
            $('select').material_select();

            var mapName = FlowRouter.getRouteName();
            var layerName = Session.get('selectedLayer');

            if(layerName == 'zonesGeo'){
                subscribeToZone(year, entity);
            }else if(layerName == 'municipalities'){
                subscribeToCity(year, entity);
            }else if(layerName == 'county_web'){
                subscribeToCounty(year, entity);
            }else{
                subscribeToUrbanCenter(year, entity);
            }

            if(mapName == '3dmap'){
                if(Session.equals('showBuildings', true)){
                    if(year == 2010){
                        for(var i= viewer.dataSources.length - 1; i > 0; i--){
                            if(viewer.dataSources.get(i).name == "newBuildings"){
                                viewer.dataSources.remove(viewer.dataSources.get(i));
                            }
                        }
                    }
                    Session.set('spinning', true);
                    var source = new Cesium.GeoJsonDataSource('newBuildings');
                    if(layerName == 'zonesGeo'){
                        Meteor.call('findNewBuildingsInZone', entity, year, function(error, response){
                            if(error){
                                Materialize.toast(error.reason, 4000);
                            }else{
                                viewer.dataSources.add(source);
                                addNewBuildings(source, response, year);
                                Session.set('spinning', false);
                            }
                        });
                    }else if(layerName == 'urban_centers'){
                        Meteor.call('findNewBuildingsInUc', entity, year, function(error, response){
                            if(error){
                                Materialize.toast(error.reason, 4000);
                            }else{
                                viewer.dataSources.add(source);
                                addNewBuildings(source, response, year);
                                Session.set('spinning', false);
                            }
                        })
                    }

                }

            }

        }
    });


}