/**
 * Created by jmartinez on 3/24/2016.
 */
if(Meteor.isClient){

    Template.addUser.events({
        "submit form": function(event, template){
            event.preventDefault();
            var dataToSend = {};
            var profile = {};

            profile['firstName'] =  $('#firstName').val();
            profile["lastName"] = $('#lastName').val();
            profile["organization"] = $('#organization').val();


            dataToSend["email"] = $('#email').val();
            dataToSend["password1"] = $('#password1').val();
            dataToSend["password2"] = $("#password2").val();
            dataToSend["role"] = $("#role option:selected").val();
            dataToSend["profile"] = profile;
            Meteor.call("addNewUser", dataToSend);
            alert('User added');

        }
    });

    Template.addUser.rendered = function(){
        $('#addNewUser').validate({
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
    }

}