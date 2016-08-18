/**
 * Created by jmartinez on 8/18/16.
 */
import { check } from 'meteor/check';
if(Meteor.isServer){
    Meteor.publish('grouped_cities', function(city){
        check(city, [String]);
        var fields;
        var thisUser = Meteor.users.findOne({_id:this.userId});



        if(Roles.userIsInRole(thisUser._id), ['admin']){
            fields = {
                _id: 1,
                city_name:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                emp_sim: 1
            };
            return muniSummary.find({city_name:{$in:city}}, {fields:fields});
        }else{
            //console.log(fields);
            fields = {
                _id: 1,
                city_name:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                emp_sim: 1
            };
            return muniSummary.find({city_name:{$in:city}}, {fields:fields});
        }

    });
    
    Meteor.publish('cities_by_year', function(year, measure){
        check(year, Number);
        check(measure, String);

        var fieldsToGet = {};
        fieldsToGet[measure] = 1;
        fieldsToGet['city_name'] = 1;
        fieldsToGet['sim_year'] = 1;

        return muniSummary.find({sim_year:{$in:[2010, year]}}, {fields: fieldsToGet});
    })
}


