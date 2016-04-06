/**
 * Created by jmartinez on 4/6/16.
 */
if(Meteor.isClient){
    
    Template.DeleteUser_page.helpers({
        users: function(){
            return Meteor.users.find({}).fetch();
        }
    });
    
    Template.DeleteUser_page.events({
        "click #btnDelete": function(event, template){
            event.preventDefault();
            var userId = $('#deleteUserSelect option:selected').val();
            Meteor.call('deleteUser', userId);
        }
    });
    
    Template.DeleteUser_page.onCreated(function(){
        var self = this;
        self.autorun(function(){
            self.subscribe('users');
        });
    })
}