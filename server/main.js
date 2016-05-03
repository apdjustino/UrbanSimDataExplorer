/**
 * Created by jmartinez on 4/5/16.
 */
import '../imports/api/zoneData/publications.js';
import '../imports/api/users/publications.js';
import '../imports/api/zoneGeoData/publications.js';
import '../imports/api/countyData/publications.js';

if(Meteor.isServer){
    Accounts.onCreateUser(function(options, user){
        user.profile = options.profile;
        return user;
    });
}