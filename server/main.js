/**
 * Created by jmartinez on 4/5/16.
 */
import '../imports/api/zoneData/publications.js';
import '../imports/api/users/publications.js';
import '../imports/api/countyData/publications.js';
import '../imports/api/comments/publications.js';
import '../imports/api/buildings/publications.js';
import '../imports/api/parcels/publications.js';
import '../imports/api/muniData/publications.js';
import '../imports/api/ucData/publications.js';
import '../imports/api/scenarios/publications.js';

if(Meteor.isServer){
    Accounts.onCreateUser(function(options, user){
        user.profile = options.profile;
        return user;
    });

    Meteor.startup(function(){
        Accounts.urls.enrollAccount = function(token){
            return Meteor.absoluteUrl('enroll-account/' + token)
        };

        Accounts.urls.resetPassword = function(token){
            return Meteor.absoluteUrl('reset-password/' + token);
        };
        
        Accounts.emailTemplates.from = 'Justin Martinez <jmartinez@drcog.org>';
        Accounts.emailTemplates.siteName = 'DRCOG Land Use Explorer';
        Accounts.emailTemplates.enrollAccount.subject = function(user){
            return user.profile.firstName + ' ' + user.profile.lastName + ', you have been invited to join the DRCOG Land Use Explorer';
        };
        
        Accounts.emailTemplates.enrollAccount.text = function(user, url){
            return "Hello " + user.profile.firstName + ", \n\n You are invited to join the DRCOG Land Use Explorer project. Your account will " +
                "allow you to review DRCOG's latest land use forecast, provide feedback, and download the results. To get started, click on the link" +
                " below and set up your password. \n\n" + url; 
        };

        Accounts.emailTemplates.resetPassword.subject = function(user){
            return 'A password reset request has been submitted to your DRCOG Land Use Explorer account';
        };

        //process.env.MAIL_URL = "smtp://justin%40sandbox4851f242dc32413caf7306f4f466e0d1.mailgun.org:destroy1@smtp.mailgun.org:587"
        process.env.MAIL_URL = "smtp://10.0.1.201:25";

        //set index for buildings and buildings centroid collection
        //buildings_centroids._ensureIndex({'geometry.coordinates': '2dsphere'});

        buildings._ensureIndex({'properties._zone_id': 1});
        buildings._ensureIndex({'properties._uc_name': 1});
        // parcels._ensureIndex({'properties.parcel_id': 1});
        
    });
}