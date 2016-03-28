/**
 * Created by jmartinez on 3/24/2016.
 */
Meteor.methods({
    addNewUser: function(data){
        var id = Accounts.createUser({
            email: data['email'],
            password: data['password1'],
            profile: data['profile']
        });
        Roles.addUsersToRoles(id, data['role']);
    }, addNewPublicUser: function(data){
        var id = Accounts.createUser({
            email: data['email'],
            password: data['password1'],
            profile: data['profile']
        });
        Roles.addUsersToRoles(id, "public");
    }
});