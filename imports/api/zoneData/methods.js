/**
 * Created by jmartinez on 5/9/16.
 */
import {check} from 'meteor/check';
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
        
        
    }
    
});