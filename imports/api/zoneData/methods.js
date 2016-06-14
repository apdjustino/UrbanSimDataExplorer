/**
 * Created by jmartinez on 5/9/16.
 */
import {check} from 'meteor/check';
exec = Npm.require('child_process').exec;
Fiber = Npm.require('fibers');
Future = Npm.require('fibers/future');
Meteor.methods({
    
    downloadData: function(geo, year){
        if(!Meteor.userId()){
            throw new Meteor.Error('Not logged in.');
        }else{
            check(geo, String);
            check(year, Number);
            
            //define fields based on user role
            var zoneAdminFields = {
                _id: 0,
                zone_id:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                median_income_sim: 1,
                ru_sim: 1,
                emp_sim: 1,
                emp1_sim: 1,
                emp2_sim: 1,
                emp3_sim: 1,
                emp4_sim: 1,
                emp5_sim: 1,
                emp6_sim: 1,
                nr_sim: 1,
                res_price_sim: 1,
                non_res_price_sim: 1,
                hh_base: 1,
                pop_base:1,
                median_income_base: 1,
                ru_base: 1,
                emp_base:1,
                emp1_base: 1,
                emp2_base: 1,
                emp3_base: 1,
                emp4_base: 1,
                emp5_base: 1,
                emp6_base: 1,
                nr_base: 1,
                res_price_base: 1,
                non_res_price_base: 1
            };
            
            var countyAdminFields = {
                _id: 0,
                county_id:1,
                county_name:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                median_income_sim: 1,
                ru_sim: 1,
                emp_sim: 1,
                emp1_sim: 1,
                emp2_sim: 1,
                emp3_sim: 1,
                emp4_sim: 1,
                emp5_sim: 1,
                emp6_sim: 1,
                nr_sim: 1,
                res_price_sim: 1,
                non_res_price_sim: 1,
                hh_base: 1,
                pop_base:1,
                median_income_base: 1,
                ru_base: 1,
                emp_base:1,
                emp1_base: 1,
                emp2_base: 1,
                emp3_base: 1,
                emp4_base: 1,
                emp5_base: 1,
                emp6_base: 1,
                nr_base: 1,
                res_price_base: 1,
                non_res_price_base: 1
            };

            var zonePublicFields = {
                _id: 0,
                zone_id:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                emp_sim: 1,
                hh_base: 1,
                pop_base:1,
                emp_base:1
            };

            var countyPublicFields = {
                _id: 0,
                county_id:1,
                county_name:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                emp_sim: 1,
                hh_base: 1,
                pop_base:1,
                emp_base:1
            };
            
            var data = undefined;
            if(geo == 'county'){
                if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                    data = countyData.find({sim_year:year}, {fields:countyAdminFields}).fetch();
                }else{
                    data = countyData.find({sim_year:year}, {fields:countyPublicFields}).fetch();
                }
                console.log(data);
                data = Papa.unparse(data);
            }else{
                if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                    data = zoneData.find({sim_year:year}, {fields:zoneAdminFields}).fetch();
                }else{
                    data = zoneData.find({sim_year:year}, {fields:zonePublicFields}).fetch();
                }

                data = Papa.unparse(data);
            }
            
            return data;
        }
        
        
    }, dataDictionary: function(){
        if(!Meteor.userId()){
            throw new Meteor.Error("Not logged in");
        }else{
            var data = undefined;
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                data = [{
                    zone_id: "Zone ID",
                    county: "County Name",
                    hh_base: "Households",
                    pop_base:"Population",
                    median_income_base: "Median Income",
                    ru_base: "Residential Unit Count",
                    emp_base:"Employment(All)",
                    emp1_base: "Education Employment",
                    emp2_base: "Entertainment Employment",
                    emp3_base: "Production Employment",
                    emp4_base: "Restaurant Employment",
                    emp5_base: "Retail Employment",
                    emp6_base: "Services Employment",
                    nr_base: "Non-Res SqFt",
                    hh_sim: "Households",
                    pop_sim: "Population",
                    median_income_sim: "Median Income",
                    ru_sim: "Residential Unit Count",
                    emp_sim: "Employment(All)",
                    emp1_sim: "Education Employment",
                    emp2_sim: "Entertainment Employment",
                    emp3_sim: "Production Employment",
                    emp4_sim: "Restaurant Employment",
                    emp5_sim: "Retail Employment",
                    emp6_sim: "Services Employment",
                    nr_sim: "Non-Res SqFt",
                    res_price_base: "Residential Price",
                    non_res_price_base: "Non-Res Price",
                    res_price_sim: "Residential Price",
                    non_res_price_sim: "Non-Res Price"
                }];
            }else{
                data = [{
                    zone_id: "Zone ID",
                    county: "County Name",
                    hh_base: "Households",
                    pop_base:"Population",
                    emp_base:"Employment(All)",
                    hh_sim: "Households",
                    pop_sim: "Population",
                    emp_sim: "Employment(All)"
                }];
            }
            unparsed = Papa.unparse(data);
            return unparsed;
        }
    }, testPython: function(){
        var fut = new Future();
        exec('/tmp/python_test.py', function(error, stdout, stderror){
            new Fiber(function(){
                fut.return('Python was here');
            }).run();
        });
        return fut.wait();
    }
    
});