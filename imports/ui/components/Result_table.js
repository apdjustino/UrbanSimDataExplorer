/**
 * Created by jmartinez on 4/5/16.
 */
import { measureNameMap } from '../../ui/components/Global_helpers.js';
import '../../ui/pages/html/CommentModal_body.html';
import '../../ui/pages/js/CommentModal_body.js';
import {colorCesiumMap} from '../../ui/components/CesiumMapFunctions.js';
import {colorMap} from '../../startup/client/mapFunctions.js';

if(Meteor.isClient){

    Template.Result_table.onRendered(function(){
        $('.modal-trigger').leanModal();
        $('.tooltipped').tooltip({delay: 50});
    });

    Template.Result_table.helpers({
        tableData: function(){
            var data = Session.get('selectedData');
            if(data){
                if (data.hasOwnProperty('oneYear')){
                    return Session.get('selectedData').oneYear;
                }
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
                if(selectedZones.length == 1){
                    return true;
                }else{
                    return false
                }
            }

        }, commentCount: function(measure){
            var year = Session.get('selectedYear');
            var zone = Session.get('selectedZone')[0];
            var id = zone + '-' + measure + '-' + year;
            return Comments.getCollection().find({referenceId: id}).count();
        }, is2010: function(){
            return Session.equals('selectedYear', 2010);
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
        }, "click .queryTotals": function(event, target){
            Session.set('spinning', true);
            var mapName = FlowRouter.getRouteName();
            var selectedVar = event.target.id;
            var selectedYear = parseInt($('#yearSelect option:selected').val());
            var selectedLayer = Session.get('selectedLayer');

            //add orange color to selected button and remove other
            $('.queryBtnRound').each(function(idx, el){
                $(el).removeClass('orange');
            });

            $(event.target).parent().addClass('orange');

            if(selectedLayer == 'zonesGeo'){
                Meteor.subscribe("zones_by_year", selectedYear, selectedVar, {
                    onReady: function () {
                        Session.set('spinning', false);
                        var fieldObj = {};
                        fieldObj[selectedVar] = 1;
                        fieldObj['zone_id'] = 1;
                        var data = zoneData.find({sim_year: selectedYear}, {sort: {zone_id:1}}).fetch();
                        
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
                        
                        if(mapName == 'webMap'){
                            colorMap(data, selectedVar, selectedLayer)
                        }else{
                            colorCesiumMap(data, selectedVar);
                        }

                        this.stop();
                    }
                });
            }

        }, "click .queryDiffs": function(event, template){
            event.preventDefault();
            Session.set('spinning', true);
            var mapName = FlowRouter.getRouteName();
            var selectedVar = event.target.id;
            var selectedYear = parseInt($('#yearSelect option:selected').val());
            var selectedLayer = Session.get('selectedLayer');

            //add orange color to selected button and remove other
            $('.queryBtnRound').each(function(idx, el){
                $(el).removeClass('orange');
            });

            $(event.target).parent().addClass('orange');

            if(selectedLayer == 'zonesGeo'){
                Meteor.subscribe("zones_by_year", selectedYear, selectedVar, {
                    onReady: function () {
                        Session.set('spinning', false);
                        var fieldObj = {};
                        fieldObj[selectedVar] = 1;
                        fieldObj['zone_id'] = 1;
                        var data = zoneData.find({sim_year: selectedYear}, {sort: {zone_id:1}}).fetch();
                        
                        var baseData = zoneData.find({sim_year: 2010}, {sort: {zone_id:1}}).fetch();
                        var mappedData = data.map(function(row, idx){

                            var rowData = row;
                            rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                            return rowData
                        });
                        
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
                        var baseData = muniSummary.find({sim_year: 2010}, {sort: {city_name:1}}).fetch();
                        var mappedData = data.map(function(row, idx){

                            var rowData = row;
                            rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                            return rowData
                        });
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
                        var baseData = countyData.find({sim_year: 2010}, {sort: {county_name:1}}).fetch();
                        var mappedData = data.map(function(row, idx){

                            var rowData = row;
                            rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                            return rowData
                        });
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
                        var baseData = ucSummary.find({sim_year: 2010}, {sort: {NAME:1}}).fetch();
                        var mappedData = data.map(function(row, idx){

                            var rowData = row;
                            rowData[selectedVar] = row[selectedVar] - baseData[idx][selectedVar];
                            return rowData
                        });
                        if(mapName == 'webMap'){
                            colorMap(data, selectedVar, selectedLayer)
                        }else{
                            colorCesiumMap(data, selectedVar);
                        }

                        this.stop();
                    }
                });
            }
        }
    })


}