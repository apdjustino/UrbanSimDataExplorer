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

        if(year == 2010){year = 2015;}

        return countyData.find({sim_year:year}, {fields: fieldsToGet});
    });
    
    Meteor.publish('counties', function(){
        return countyData.find({});
    });
    
    
}