/**
 * Created by jmartinez on 4/5/16.
 */
import { check } from 'meteor/check';

if(Meteor.isServer){
    
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

    var publicSimFields = {
        _id: 1,
        zone_id:1,
        sim_year: 1,
        hh_sim: 1,
        pop_sim: 1,
        emp_sim: 1
    };
    
    var adminBaseFields = {
        _id: 1,
        zone_id: 1,
        sim_year: 1,
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

    var publicBaseFields = {
        _id: 1,
        zone_id:1,
        sim_year: 1,
        hh_base: 1,
        pop_base:1,
        emp_base:1
    };
    
    Meteor.publish('grouped_zones', function(year, zones){
        check(year, Number);
        check(zones, [Number]);
        var fields;
        var thisUser = Meteor.users.findOne({_id:this.userId});
        var queryYear = year;



        if(_.contains(thisUser.roles, 'admin')){
            if(year == 2010){queryYear = 2015; fields = adminBaseFields}else{fields = adminSimFields;}
            return zoneData.find({sim_year: queryYear, zone_id:{$in:zones}}, {fields:fields});
        }else{
            //console.log(fields);
            if(year == 2010){queryYear = 2015; fields = publicBaseFields}else{fields = publicSimFields;}
            return zoneData.find({sim_year: queryYear, zone_id:{$in:zones}}, {fields:fields});
        }

    });

    Meteor.publish("zones_by_year", function(year, measure){
        check(year, Number);
        check(measure, String);

        var fieldsToGet = {};
        fieldsToGet[measure] = 1;
        fieldsToGet['zone_id'] = 1;
        fieldsToGet['sim_year'] = 1;

        if(year == 2010){year = 2015;}

        return zoneData.find({sim_year:year}, {fields: fieldsToGet});
    });
    
    
    
}