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
});

Router.route('/map',  function(){
    this.render('webMap');
});