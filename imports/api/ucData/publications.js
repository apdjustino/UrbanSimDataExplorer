/**
 * Created by jmartinez on 8/19/16.
 */
/**
 * Created by jmartinez on 8/18/16.
 */
import { check } from 'meteor/check';
if(Meteor.isServer){
    Meteor.publish('grouped_urban_centers', function(uc){
        check(uc, [String]);
        var fields;
        var thisUser = Meteor.users.findOne({_id:this.userId});



        if(Roles.userIsInRole(thisUser._id), ['admin']){
            fields = {
                _id: 1,
                NAME:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                emp_sim: 1
            };
            return ucSummary.find({NAME:{$in:uc}}, {fields:fields});
        }else{
            //console.log(fields);
            fields = {
                _id: 1,
                NAME:1,
                sim_year: 1,
                hh_sim: 1,
                pop_sim: 1,
                emp_sim: 1
            };
            return ucSummary.find({NAME:{$in:uc}}, {fields:fields});
        }

    });

    Meteor.publish('uc_by_year', function(year, measure){
        check(year, Number);
        check(measure, String);

        var fieldsToGet = {};
        fieldsToGet[measure] = 1;
        fieldsToGet['NAME'] = 1;
        fieldsToGet['sim_year'] = 1;

        return ucSummary.find({sim_year:{$in:[2010, year]}}, {fields: fieldsToGet});
    })
}


