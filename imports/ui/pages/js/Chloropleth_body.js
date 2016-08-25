/**
 * Created by jmartinez on 8/8/16.
 */
import {colorCesiumMap} from '../../components/CesiumMapFunctions.js';
import {colorBuildings} from '../../components/CesiumMapFunctions.js';
import {resetBuildings} from '../../components/CesiumMapFunctions.js';
import {subscribeToZone} from '../../components/CesiumMapFunctions.js';
import {colorMap} from '../../../startup/client/mapFunctions.js';
if(Meteor.isClient){
    
    Template.Chloropleth_body.helpers({
        YearSelect_args: function(){
            return {
                multiple: "",
                selectId: "queryYearSelect",
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
        }, VariableSelect_args: function(){
            var data;
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                data = [
                    {value: 'hh_sim', name: 'Households'},
                    {value: 'pop_sim', name: 'Population'},
                    {value: 'median_income_sim', name: 'Median Income'},
                    {value: 'ru_sim', name: 'Residential Unit Count'},
                    {value: 'emp_sim', name: 'Employment(All)'},
                    {value: 'emp1_sim', name: 'Education Employment'},
                    {value: 'emp2_sim', name: 'Entertainment Employment'},
                    {value: 'emp3_sim', name: 'Production Employment'},
                    {value: 'emp4_sim', name: 'Restaurant Employment'},
                    {value: 'emp5_sim', name: 'Retail Employment'},
                    {value: 'emp6_sim', name: 'Services Employment'},
                    {value: 'nr_sim', name: 'Non-Res SqFt'},
                    {value: 'res_price_sim', name: 'Residential Price'},
                    {value: 'non_res_price_sim', name: 'Non-Res Price'}
                ];
            }else{
                data = [
                    {value: 'hh_sim', name: 'Households'},
                    {value: 'pop_sim', name: 'Population'},
                    {value: 'emp_sim', name: 'Employment'}
                ];
            }
            return {
                multiple: "",
                selectId: "variableSelect",
                label: "Variable",
                selectData: data
            }
        }
    });

    Template.Chloropleth_body.events({
        "click #btnQuery": function(event, template){
            var mapName = FlowRouter.getRouteName();
            event.preventDefault();
            Session.set('spinning', true);
            var selectedYear = parseInt($('#queryYearSelect option:selected').val());
            var selectedVar = $('#variableSelect option:selected').val();
            var selectedLayer = Session.get('selectedLayer');

            if(selectedLayer == 'zonesGeo'){
                Meteor.subscribe("zones_by_year", selectedYear, selectedVar, {
                    onReady: function () {
                        Session.set('spinning', false);
                        var fieldObj = {};
                        fieldObj[selectedVar] = 1;
                        fieldObj['zone_id'] = 1;
                        var data = zoneData.find({sim_year: selectedYear}, {sort: {zone_id:1}}).fetch();
                        if($('#queryDiff').prop('checked')){
                            var baseData = zoneData.find({sim_year: 2010}, {sort: {zone_id:1}}).fetch();
                            var mappedData = data.map(function(row, idx){

                                var rowData = row;
                                rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                                return rowData
                            });
                        }
                        if(mapName == 'webMap'){

                            colorMap(data, selectedVar, selectedLayer)
                        }else{
                            colorCesiumMap(data, selectedVar);
                        }

                        this.stop();
                    }
                });
            }else if(selectedLayer == 'municipalities'){
                Meteor.subscribe("cities_by_year", selectedYear, selectedVar, {
                    onReady: function () {
                        Session.set('spinning', false);
                        var fieldObj = {};
                        fieldObj[selectedVar] = 1;
                        fieldObj['city_name'] = 1;
                        var data = muniSummary.find({sim_year: selectedYear}, {sort: {city_name:1}}).fetch();
                        if($('#queryDiff').prop('checked')){
                            var baseData = muniSummary.find({sim_year: 2010}, {sort: {city_name:1}}).fetch();
                            var mappedData = data.map(function(row, idx){

                                var rowData = row;
                                rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                                return rowData
                            });
                        }
                        if(mapName == 'webMap'){
                            colorMap(data, selectedVar, selectedLayer)
                        }else{
                            colorCesiumMap(data, selectedVar);
                        }

                        this.stop();
                    }
                });
            }else if(selectedLayer == 'county_web'){
                Meteor.subscribe("counties_by_year", selectedYear, selectedVar, {
                    onReady: function () {
                        Session.set('spinning', false);
                        var fieldObj = {};
                        fieldObj[selectedVar] = 1;
                        fieldObj['county_name'] = 1;
                        var data = countyData.find({sim_year: selectedYear}, {sort: {county_name:1}}).fetch();
                        if($('#queryDiff').prop('checked')){
                            var baseData = countyData.find({sim_year: 2010}, {sort: {county_name:1}}).fetch();
                            var mappedData = data.map(function(row, idx){

                                var rowData = row;
                                rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                                return rowData
                            });
                        }
                        if(mapName == 'webMap'){
                            colorMap(data, selectedVar, selectedLayer)
                        }else{
                            colorCesiumMap(data, selectedVar);
                        }

                        this.stop();
                    }
                });
            }else{
                Meteor.subscribe("uc_by_year", selectedYear, selectedVar, {
                    onReady: function () {
                        Session.set('spinning', false);
                        var fieldObj = {};
                        fieldObj[selectedVar] = 1;
                        fieldObj['NAME'] = 1;
                        var data = ucSummary.find({sim_year: selectedYear}, {sort: {NAME:1}}).fetch();
                        if($('#queryDiff').prop('checked')){
                            var baseData = ucSummary.find({sim_year: 2010}, {sort: {NAME:1}}).fetch();
                            var mappedData = data.map(function(row, idx){

                                var rowData = row;
                                rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                                return rowData
                            });
                        }
                        if(mapName == 'webMap'){
                            colorMap(data, selectedVar, selectedLayer)
                        }else{
                            colorCesiumMap(data, selectedVar);
                        }

                        this.stop();
                    }
                });
            }
                


        }, "change #queryYearSelect": function(event, template){
            var year = parseInt($('#queryYearSelect option:selected').val());
            Session.set('selectedYear', year);
            var selector = '#yearSelect option[value=' + year + ']';
            $(selector).prop('selected', true);
            $('select').material_select();
            var zone = Session.get('selectedZone');
            if(zone.length > 0){
                subscribeToZone(year, zone);
            }

        }, "click #styleBuildings": function(event, template){
            var mapName = FlowRouter.getRouteName();
            if(mapName = '3dmap'){
                if(event.target.checked){
                    colorBuildings();
                }else{
                    resetBuildings();
                }
            }
        }
    })
    
}