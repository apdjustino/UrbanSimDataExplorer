/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){

    Template.Login_page.helpers({
        LoginModal_args: function(){
            return {
                modalId: 'createPublicAccountModal',
                bodyTemplate: 'LoginModal_body',
                modalTitle: 'Create New Account',
                modalData: ''
            }
        }, Credentials_args: function(){
            return {
                modalId: 'loginModal',
                bodyTemplate: 'CredentialsModal_body',
                modalTitle: 'LOG IN',
                modalData: ''
            }
        }
    });

    Template.CredentialsModal_body.events({
        "submit #loginForm": function(event, template){
            event.preventDefault();
            var email = $('#userEmail').val();
            var password = $('#password').val();
            Meteor.loginWithPassword(email, password, function(error){
                if(error){
                    if(error.error == 403){
                        Materialize.toast("Incorrect Email and/or Password", 5000);
                    }else{
                        Materialize.toast.error(error.reason, 5000);
                    }
                }else{

                    $('#sidenav-overlay').remove();
                    $('.navLink').sideNav('hide');
                    
                }
            });

        }, "click #resetPassword": function(event, template){
            event.preventDefault();
            $('#ResetPasswordModal').openModal();
        }
    });


    Template.SignUp_body.events({
        "submit #addNewPublicUser": function(event, template){
            event.preventDefault();
            var dataToSend = {};
            var profile = {};

            profile['firstName'] =  $('#firstName').val();
            profile["lastName"] = $('#lastName').val();
            profile["organization"] = $('#organization').val();


            dataToSend["email"] = $('#email').val();
            dataToSend["password1"] = $('#password1').val();
            dataToSend["password2"] = $("#password2").val();
            dataToSend["profile"] = profile;
            Meteor.call("addNewPublicUser", dataToSend);
            Meteor.loginWithPassword(dataToSend["email"], dataToSend["password1"], function(error){
                if(error){
                    console.log(error);
                }else{
                    $('#createPublicAccountModal').removeClass('fade');
                    $('#createPublicAccountModal').modal('hide');
                    $('#loginModal').modal('hide');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    FlowRouter.go('/map');
                }
            })
        }
    });


    Template.SignUp_body.rendered = function(){
        $('#addNewPublicUser').validate({
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
    };
    
    Template.Login_page.helpers({
        ResetPassword_args: function(){
            return {
                modalId: "ResetPasswordModal",
                bottom: "",
                modalHeaderTemplate: "ResetPasswordModal_header",
                modalBodyTemplate: "ResetPasswordModal_body"
                
            }
        }
    });

    Template.ResetPasswordModal_body.events({
        "submit #resetPasswordForm": function(event, template){
            event.preventDefault();
            var email = $('#emailPasswordReset').val();
            debugger;
            Meteor.call('sendResetEmail', email, function(error){
                if(error){
                    Materialize.toast("Cannot find email address. Please enter a valid email or create a new account.", 4000)
                }else{
                    Materialize.toast('An email with a reset-password link has been sent to your email address.', 4000)
                }
            })
        }
    });


    Template.CredentialsModal_body.events({
        
    })

    Template.Login_page.rendered = function(){
        $('#loginForm').validate();
    }

}