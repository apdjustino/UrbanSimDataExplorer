/**
 * Created by jmartinez on 5/2/16.
 */
import {colorMap} from '../../../startup/client/mapFunctions.js';
import {drawChart} from '../../../startup/client/mapFunctions.js';
if(Meteor.isClient){
    
    Template.CountyTabPane_body.helpers({
        admin_variables: function(){
            return [
                {abv: 'hh_sim', abv_base: 'hh_base'},
                {abv: 'pop_sim', abv_base: 'pop_base'},
                {abv: 'median_income_sim', abv_base: 'median_income_base'},
                {abv: 'ru_sim', abv_base: 'ru_base'},
                {abv: 'emp_sim', abv_base: 'emp_base'},
                {abv: 'emp1_sim', abv_base: 'emp1_base'},
                {abv: 'emp2_sim', abv_base: 'emp2_base'},
                {abv: 'emp3_sim', abv_base: 'emp3_base'},
                {abv: 'emp4_sim', abv_base: 'emp4_base'},
                {abv: 'emp5_sim', abv_base: 'emp5_base'},
                {abv: 'emp6_sim', abv_base: 'emp6_base'},
                {abv: 'nr_sim', abv_base: 'nr_base'},
                {abv: 'res_price_sim', abv_base: 'res_price_base'},
                {abv: 'non_res_price_sim', abv_base: 'non_res_price_base'}
            ];              
            
        }, public_variables: function(){
            return [
                {abv: 'hh_sim', abv_base: 'hh_base'},
                {abv: 'pop_sim', abv_base: 'pop_base'},
                {abv: 'emp_sim', abv_base: 'emp_base'}
            ];
        }, isBaseYear: function(){
            return Session.get('isBaseYear');
        }, countyResults: function(){
            return Session.get('countyResults');
        }, queryReturn: function(){
            return Session.get('queryReturn');
        }, selectedVariable: function(){
            return Session.get('selectedVariable');
        }
    });

    Template.CountyTabPane_body.events({
        "change #yearSelectCounty": function(event, template){
            var selectedYear = $('#yearSelectCounty option:selected').val();
            var isBaseYear = false;
            if(selectedYear == 2010){
                isBaseYear = true;
            }
            Session.set('isBaseYear', isBaseYear);
        }, "click #btnCountyQuery": function(event, template){
            event.preventDefault();
            var selectedYear = parseInt($('#yearSelectCounty option:selected').val());
            var selectedVar = $('#variableSelectCounty option:selected').val();
            Session.set('selectedVariable', selectedVar);
            var countySubscription = Meteor.subscribe('counties_by_year', selectedYear, selectedVar, {
                onReady: function(){
                    var commaFormat = d3.format(',');
                    if(selectedYear === 2010){selectedYear = 2015;}
                    var fieldsToGet = {};
                    fieldsToGet[selectedVar] = 1;
                    fieldsToGet['county_id'] = 1;
                    fieldsToGet['county_name'] = 1;
                    fieldsToGet['sim_year'] = 1;
                    var data = countyData.find({sim_year: selectedYear}, {fields: fieldsToGet}).fetch();
                    var output = [];
                    data.forEach(function(cv){
                        var obj = {};
                        obj['county_id'] = cv['county_id'];
                        obj['county_name'] = cv['county_name'];
                        obj['sim_year'] = cv['sim_year'];
                        obj['cat'] = selectedVar;
                        obj['value'] = commaFormat(cv[selectedVar]);
                        output.push(obj);

                    });
                    Session.set('countyResults', output);
                    Session.set('queryReturn', true);

                    colorMap(data, selectedVar, 'county');

                    this.stop();
                }
            });

        }, "click .showLegend": function(event){
            if(!event.target.checked){
                $('#legendList').animate({'left':'88%'}, 1000)
            }else {
                $('#legendList').animate({'left':'44%'}, 1000)
            }

        }
    
    });

    Template.CountyTabPane_body.onCreated(function(){
        Session.set('isBaseYear', true);
        Session.set('countyResults', undefined);
        Session.set('queryReturn', false);
        Session.set('selectedVariable', undefined);

        var self = this;
        this.autorun(function(){
            self.subscribe('counties', {
                onReady: function(){
                    var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');
                    var regionalChartData = _.keys(counties).map(function(key){
                        var simData = counties[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                    
                    drawChart(regionalChartData);

                }
            });
        });
    })
    
}