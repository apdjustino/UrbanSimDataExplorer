/**
 * Created by jmartinez on 3/28/2016.
 */
if(Meteor.isClient){

    Template.changePassword.helpers({
        users: function(){
            return Meteor.users.find({}).fetch();
        }
    });

    Template.changePassword.events({
         "submit #changePassword": function(event, template){
             event.preventDefault();
             var userId = $('#userDropDownSelectPass option:selected').val();
             var new_password = $('#password2').val();
             Meteor.call("newPassword", userId, new_password, function(error, result){
                 sAlert.success("Password Changed.", {position: 'bottom'})
             })
         }
    });

    Template.changePassword.rendered = function(){
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
    }

}