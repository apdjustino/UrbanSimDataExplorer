/**
 * Created by jmartinez on 3/24/2016.
 */
if(Meteor.isServer){
    Accounts.onCreateUser(function(options, user){
        user.profile = options.profile;
        return user;
    });
}

