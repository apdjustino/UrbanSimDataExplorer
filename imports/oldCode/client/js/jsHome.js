/**
 * Created by jmartinez on 3/28/2016.
 */
if(Meteor.isClient){

    Template.home.events({
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
                    Router.go('/map');
                }
            })
        }, "submit #loginForm": function(event, template){
            event.preventDefault();
            var email = $('#userEmail').val();
            var password = $('#password').val();
            Meteor.loginWithPassword(email, password, function(error){
                if(error){
                    if(error.error == 403){
                        sAlert.error("Incorrect Email and/or Password",{position:'bottom'});
                    }else{
                        sAlert.error(error.reason, {position:'bottom'});
                    }
                }else{
                    Router.go('/map');
                }
            })

        }
    });


    Template.createNewPublicAccount.rendered = function(){
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

    Template.home.rendered = function(){
        $('#loginForm').validate();
    }

}