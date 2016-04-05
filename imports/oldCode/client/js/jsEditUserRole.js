/**
 * Created by jmartinez on 3/28/2016.
 */
if(Meteor.isClient){

    Template.editUserRoles.events({
        'click #btnDeleteRole': function(event){
            event.preventDefault();
            var role = $('#roleList option:selected').val();
            var userId = $('#userDropDownSelect option:selected').val();
            Meteor.call("deleteRole", userId, role);


        },
        'change #userDropDownSelect': function(event){
            var email = event.currentTarget.value;
            Session.set('selectedUser', email);
        },
        'click #addNewRole': function(event, template){
            event.preventDefault();
            var role = $('#newRole option:selected').val();
            var userId = $('#userDropDownSelect option:selected').val();
            Meteor.call("addRole", userId, role);

        }
    });


    Template.editUserRoles.helpers({
        users: function(){
            return Meteor.users.find({}).fetch();
        },
        userRoles: function(userId){
            return Meteor.users.findOne({_id:userId}).roles;
        }, selectedUser: function(){
            return Session.get('selectedUser');
        }
    });


}