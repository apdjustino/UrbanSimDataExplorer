/**
 * Created by jmartinez on 4/5/16.
 */
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';


//import client components

import '../../ui/components/html/Modal_fade.html';
import '../../ui/components/html/Tab_pane.html';
import '../../ui/components/html/Result_table.html'
import '../../ui/components/Global_helpers.js';
import '../../ui/styles.css';
import '../../ui/components/Result_table.js';

//import client layouts
import '../../ui/layouts/Home_layout_page.html';

//import client page html

import '../../ui/pages/html/AddUser_page.html';
import '../../ui/pages/html/ChangePassword_page.html';
import '../../ui/pages/html/EditUserRole_page.html';
import '../../ui/pages/html/Login_page.html';
import '../../ui/pages/html/WebMap_page.html';
import '../../ui/pages/html/ZoneTabPane_body.html';

//import client page js

import '../../ui/pages/js/AddUser_page.js';
import '../../ui/pages/js/ChangePassword_page.js';
import '../../ui/pages/js/EditUserRole_page.js';
import '../../ui/pages/js/Login_page.js';
import '../../ui/pages/js/WebMap_page.js';
import '../../ui/pages/js/ZoneTabPane_body.js';

//declare routs

FlowRouter.route('/', {
    name: 'home',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'Login_page'});
    }
});

FlowRouter.route('/map', {
    name: 'webMap',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'WebMap_page'});
    }
});