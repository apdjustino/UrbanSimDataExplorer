/**
 * Created by jmartinez on 3/24/2016.
 */
Meteor.methods({
    addNewUser: function(data){
        if(!Meteor.userId()){
            throw new Meteor.error("Not logged in!");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                var id = Accounts.createUser({
                    email: data['email'],
                    password: data['password1'],
                    profile: data['profile']
                });
                Roles.addUsersToRoles(id, data['role']);
                return true;
            }
        }

    }, addNewPublicUser: function(data){
        if(!Meteor.userId()){
            throw new Meteor.error("Not logged in!");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                var id = Accounts.createUser({
                    email: data['email'],
                    password: data['password1'],
                    profile: data['profile']
                });
                Roles.addUsersToRoles(id, "public");
            }
        }

    }, addRole: function(userId, role){
        if(!Meteor.userId()){
            throw new Meteor.error("Not logged in!");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                Roles.addUsersToRoles(userId, role);
            }
        }
    }, deleteRole: function(userId, role){
        if(!Meteor.userId()){
            throw new Meteor.error("Not logged in!");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                Roles.removeUsersFromRoles([userId], role);
            }
        }
    }, newPassword: function(userId, new_password){
        if(!Meteor.userId()){
            throw new Meteor.error("Not logged in!");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                Accounts.setPassword(userId, new_password);
                return true;
            }
        }
    }
});