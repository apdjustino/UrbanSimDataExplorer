/**
 * Created by jmartinez on 2/16/2016.
 */
Router.configure({
    layoutTemplate:'main'
});

Router.route('/',  function(){
    this.render('webMap');
});
