/**
 * Created by jmartinez on 4/6/16.
 */
if(Meteor.isClient){
    
    Template.DeleteUser_page.helpers({
        users: function(){
            return Meteor.users.find({}).fetch();
        }, DeleteUser_args: function(){
            var users = Meteor.users.find({}).fetch();
            return {
                selectId: "deleteUserSelect",
                selectData: users.map(function(user){
                    return {name: user.emails[0].address, value: user._id}
                }), label: "User Email"
            }
        }
    });
    
    Template.DeleteUser_page.events({
        "click #btnDelete": function(event, template){
            event.preventDefault();
            var userId = $('#deleteUserSelect option:selected').val();
            Meteor.call('deleteUser', userId, function(error, response){
                if(error){
                    Materialize.toast(error.reason, 4000);
                }else{
                    Materialize.toast("User deleted.", 4000);
                    $('select').material_select();
                }
            });
        }
    });
    
    Template.DeleteUser_page.onCreated(function(){
        var self = this;
        self.autorun(function(){
            self.subscribe('users');
        });
    })
}