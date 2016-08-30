/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){

    Template.ChangePassword_page.helpers({
        users: function(){
            return Meteor.users.find({}).fetch();
        }, UserEmail_args: function(){
            var users = Meteor.users.find({}).fetch();
            return {
                selectId: "userDropDownSelectPass",
                selectData: users.map(function(user){
                    return {name: user.emails[0].address, value: user._id}
                }), label: "User Email"
            }
        }
    });

    Template.ChangePassword_page.events({
        "submit #changePassword": function(event, template){
            event.preventDefault();
            var userId = $('#userDropDownSelectPass option:selected').val();
            var new_password = $('#password2').val();
            Meteor.call("newPassword", userId, new_password, function(error, result){
                Materialize.toast("Password Changed.", 4000);
            })
        }
    });

    Template.ChangePassword_page.rendered = function(){
        $('#changePassword').validate({
            rules:{
                password1:{
                    minlength: 6
                }, password2: {
                    equalTo: "#password1",
                    minlength: 6
                }
            }, messages:{
                password2: {
                    equalTo: "Passwords do not match!"
                }
            }
        });
    };

    Template.ChangePassword_page.onCreated(function(){
        var self = this;
        self.autorun(function(){
            self.subscribe('users');
        });
    })

}