/**
 * Created by jmartinez on 5/2/16.
 */
import {check} from 'meteor/check';
if(Meteor.isServer){

    Meteor.publish('counties_by_year', function(year, measure){
        check(year, Number);
        check(measure, String);

        var fieldsToGet = {};
        fieldsToGet[measure] = 1;
        fieldsToGet['county_id'] = 1;
        fieldsToGet['county_name'] = 1;
        fieldsToGet['sim_year'] = 1;
        
        return countyData.find({sim_year:year}, {fields: fieldsToGet});
    });
    
    Meteor.publish('counties', function(){
        return countyData.find({});
    });
    
    Meteor.publish('grouped_counties', function(counties){
        try{
            check(counties, [String]);    
        }catch(e){
            //do nothing
        }
        
        var thisUser = Meteor.users.findOne({_id:this.userId});



        if(Roles.userIsInRole(thisUser._id), ['admin']){
            var adminSimFields = {
                _id: 1,
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
                non_res_price_sim: 1
            };
            return countyData.find({zone_id:{$in:counties}}, {fields:adminSimFields});
        }else{
            //console.log(fields);
            var publicSimFields = {
                _id: 1,
                zone_id:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                emp_sim: 1
            };
            return countyData.find({zone_id:{$in:counties}}, {fields:publicSimFields});
        }
    })
    
    
}