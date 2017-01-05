/**
 * Created by jmartinez on 5/16/16.
 */
if(Meteor.isClient){
    
    Template.SetPassword_page.events({
        "submit #setPassword": function(event){
            event.preventDefault();
            var token = FlowRouter.getParam('token');
            var newPassword = $('#password1').val();
            Accounts.resetPassword(token, newPassword, function(error){
                if(error){
                    sAlert.error(error.reason, {position: 'bottom'});
                }else{
                    FlowRouter.go('/');
                }
            })
        }
    });
    
    Template.SetPassword_page.onCreated(function(){
        var self = this;
        var token = FlowRouter.getParam('token');
        self.autorun(function(){
            self.subscribe("enrolledUser", token);
        })
    });

    Template.SetPassword_page.onRendered(function(){
        $('#setPassword').validate({
            rules: {
                password1: {
                    minlength:6
                },
                password2: {
                    equalTo: "#password1",
                    minlength:6
                }
            },
            messages:{
                password2:{
                    equalTo: "Passwords do not match!"
                }
            }
        });
    })
    
}