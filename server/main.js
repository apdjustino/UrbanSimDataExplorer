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

    Meteor.startup(function(){
        Accounts.urls.enrollAccount = function(token){
            return Meteor.absoluteUrl('enroll-account/' + token)
        };

        //process.env.MAIL_URL = "smtp://justin%40sandbox4851f242dc32413caf7306f4f466e0d1.mailgun.org:destroy1@smtp.mailgun.org:587"
        process.env.MAIL_URL = "smtp://10.0.1.201:25"

    });
}