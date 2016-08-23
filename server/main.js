/**
 * Created by jmartinez on 4/5/16.
 */
import '../imports/api/zoneData/publications.js';
import '../imports/api/users/publications.js';
import '../imports/api/zoneGeoData/publications.js';
import '../imports/api/countyData/publications.js';
import '../imports/api/comments/publications.js';
import '../imports/api/buildings/publications.js';
import '../imports/api/parcels/publications.js';
import '../imports/api/muniData/publications.js';
import '../imports/api/ucData/publications.js';

if(Meteor.isServer){
    Accounts.onCreateUser(function(options, user){
        user.profile = options.profile;
        return user;
    });

    Meteor.startup(function(){
        Accounts.urls.enrollAccount = function(token){
            return Meteor.absoluteUrl('enroll-account/' + token)
        };
        
        Accounts.emailTemplates.from = 'DRCOG Land Use Team <no-reply@drcog.org>';
        Accounts.emailTemplates.siteName = 'DRCOG Land Use Explorer';
        Accounts.emailTemplates.enrollAccount.subject = function(user){
            return user.profile.firstName + ' ' + user.profile.lastName + ', you have been invited to join the DRCOG Land Use Explorer';
        };
        
        Accounts.emailTemplates.enrollAccount.text = function(user, url){
            return "Hello " + user.profile.firstName + ", \n\n You are invited to join the DRCOG Land Use Explorer project. Your account will " +
                "allow you to review DRCOG's latest land use forecast, provide feedback, and download the results. To get started, click on the link" +
                " below and set up your password. \n\n" + url; 
        };

        //process.env.MAIL_URL = "smtp://justin%40sandbox4851f242dc32413caf7306f4f466e0d1.mailgun.org:destroy1@smtp.mailgun.org:587"
        process.env.MAIL_URL = "smtp://10.0.1.201:25";

        //set index for buildings and buildings centroid collection
        //buildings_centroids._ensureIndex({'geometry.coordinates': '2dsphere'});
        buildings_centroids._ensureIndex({'geometry': '2dsphere'});
        buildings._ensureIndex({'properties.zone_id': 1});
        buildings._ensureIndex({'properties.urban_cent': 1});
        parcels_centroids._ensureIndex({'geometry': '2dsphere'});
        parcels._ensureIndex({'properties.parcel_id': 1});
        urbansim_buildings._ensureIndex({'plan_id':1});
        urbansim_parcels._ensureIndex({'parcel_id':1});
        
    });
}