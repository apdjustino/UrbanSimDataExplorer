/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){

    Template.EditUserRole_page.events({
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


    Template.EditUserRole_page.helpers({
        users: function(){
            return Meteor.users.find({}).fetch();
        },
        userRoles: function(userId){
            return Meteor.users.findOne({_id:userId}).roles;
        }, selectedUser: function(){
            return Session.get('selectedUser');
        }
    });

    Template.EditUserRole_page.onCreated(function(){
        var self = this;
        self.autorun(function(){
            self.subscribe('users');
        });
    });
}