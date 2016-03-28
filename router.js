/**
 * Created by jmartinez on 2/16/2016.
 */
Router.configure({
    layoutTemplate:'main'
});

Router.route('/',  function(){
    this.render('home');
});


Router.route('/admin/adduser', function(){
    this.render('addUser');
}, {
    onBeforeAction: function(){
        if(!Meteor.user()){
            this.render('home')
        }else{
            var user = Meteor.user();
            if(Roles.userIsInRole(user, ['admin'])){
                this.next();
            }else{
                this.render('home');
            }
        }

    }
});

Router.route('/admin/changeroles', function(){
    this.render('editUserRoles');
}, {
    onBeforeAction: function(){
        if(!Meteor.user()){
            this.render('home')
        }else{
            var user = Meteor.user();
            if(Roles.userIsInRole(user, ['admin'])){
                this.next();
            }else{
                this.render('home');
            }
        }

    }
});

Router.route('/map',  function(){
    this.render('webMap');
}, {
    onBeforeAction: function(){
        if(!Meteor.user()){
            this.render('home')
        }else{
            this.next();
        }
    }
});