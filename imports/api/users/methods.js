/**
 * Created by jmartinez on 4/6/16.
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

        var id = Accounts.createUser({
            email: data['email'],
            password: data['password1'],
            profile: data['profile']
        });
        Roles.addUsersToRoles(id, "public");



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
                if(Meteor.isServer){
                    Accounts.setPassword(userId, new_password);
                    return true;
                }

            }
        }
    }, deleteUser: function(userId){
        if(!Meteor.userId()){
            throw new Meteor.error("Not logged in!");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                Meteor.users.remove({_id: userId});
                return true
            }
        }

    }, sendInvite: function(data){
        if(!Meteor.userId()){
            throw new Meteor.error("Not logged in!");
        }else{
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                var id = Accounts.createUser({
                    email: data['email'],
                    profile: data['profile']
                });
                Roles.addUsersToRoles(id, data['role']);
                Accounts.sendEnrollmentEmail(id);
            }
        }
    }, addNewScenario: function(name){
        if(!Meteor.userId()){
            throw new Meteor.Error("Not logged in!");
        }else{
            var scenarioObj = {name: name, zoning: []};
            Meteor.users.update({_id: Meteor.userId()}, {$addToSet:{'profile.scenarios': scenarioObj}});
        }
    }, removeScenario: function(name){
        if(!Meteor.userId()){
            throw new Meteor.Error("Not logged in!");
        }else{
            Meteor.users.update({_id: Meteor.userId()}, {$pull: {'profile.scenarios':{name: name}}});
        }
    }
});