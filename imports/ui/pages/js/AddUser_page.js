/**
 * Created by jmartinez on 4/5/16.
 */
if(Meteor.isClient){

    Template.AddUser_page.events({
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

            Meteor.call("addNewUser", dataToSend, function(error){
                if(error){
                    Materialize.toast(error.reason, 5000);
                }else{
                    Materialize.toast("New user added!", 5000)
                }

            });

        }, "click #btnSendEmail": function(event){
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

            Meteor.call("sendInvite", dataToSend, function(error){
                if(error){
                    console.log(error);
                    Materialize.toast(error.reason, 5000);
                }else{
                    Materialize.toast("New user added!", 5000)
                }
                
            });
        }
    });
    
    Template.AddUser_page.helpers({
        SelectRole_args: function(){
            var test = {
                selectId: "role",
                multiple: "",
                label: "Role",
                selectData: [
                    {value: "admin", name: "Admin"},
                    {value: "drcog", name: "DRCOG User (internal)"},
                    {value: "public", name: "Public"}
                ]
            };

            console.log(test);
            return test;
        }
    });

    Template.AddUser_page.rendered = function(){
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
    };
    

}