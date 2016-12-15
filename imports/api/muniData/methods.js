/**
 * Created by jmartinez on 12/13/16.
 */
Meteor.methods({
    
   getCityNames: function(){
       return muniSummary.find({sim_year:2010}, {sort: {city_name: 1}}).fetch();
   }, getUCNames: function(){
        return ucSummary.find({sim_year:2010}, {sort: {NAME:1}}).fetch();
    }, getCountyNames: function(){
        return countyData.find({sim_year:2010}, {sort: {county_name:1}}).fetch();
    }
    
});