/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){

    Template.EditUserRole_page.events({
        'click #btnDeleteRole': function(event){
            event.preventDefault();
            var role = $('#roleList option:selected').val();
            var userId = $('#userDropDownSelect option:selected').val();
            if(role){
                Meteor.call("deleteRole", userId, role, function(error){
                    if(error){
                        sAlert.error(error.reason, {position:'bottom'});
                    }
                });
            }else{
                sAlert.error('No role selected for deletion. Select a role and then click on the delete button', {position:'bottom'});
            }



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
        }, UserSelect_args: function(){
            var users = Meteor.users.find({}).fetch();
            var data = users.map(function(user){
                return {value: user._id, name: user.emails[0].address}
            });
            return {
                selectId: "userDropDownSelect",
                multiple: "",
                label: "Email",
                selectData: data
            }
        }, RoleSelect_args: function(selectedUser) {

            return {
                selectId: "newRole",
                multiple: "",
                label: "New Role",
                selectData: [
                    {value: "admin", name: "Admin"},
                    {value: "drcog" , name: "DRCOG (internal)"},
                    {value: "public", name: "Public"}
                ]

            }
        }, UserRolesSelect_args: function(selectedUser) {
            Tracker.afterFlush(function(){
                $('select').material_select();
            });
            var roles = Meteor.users.findOne({_id: selectedUser}).roles;
            var data = roles.map(function (role) {
                return {value: role, name: role}
            });
            return {
                selectId: "roleList",
                multiple: "multiple",
                label: "User Roles",
                selectData: data
            }
        }

    });

    Template.EditUserRole_page.onCreated(function(){
        var self = this;
        self.autorun(function(){
            self.subscribe('users', {
                onReady: function(){
                    var selectedUser = Meteor.users.findOne()._id;
                    Session.set('selectedUser', selectedUser);
                }
            });
        });
    });
}