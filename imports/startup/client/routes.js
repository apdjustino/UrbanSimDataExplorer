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
import '../../ui/widgets.css';
import '../../ui/components/Result_table.js';
import '../../ui/components/html/AdminBlockHelper.html';
import '../../ui/components/html/Material_side_nav.html';
import '../../ui/components/Material_side_nav.js';
import '../../ui/components/html/Material_select.html';
import '../../ui/components/Material_select.js';
import '../../ui/components/html/Material_ul.html'
import '../../ui/components/Material_ul.js';
import '../../ui/components/html/Material_modal.html';
import '../../ui/components/Material_modal.js';
import '../../ui/components/html/Material_tabs.html';
import '../../ui/components/Material_tabs.js';
import '../../ui/components/html/Material_collapsible.html';
import '../../ui/components/Material_collapsible.js';
import '../../ui/components/html/map_legend.html';
//import client layouts
import '../../ui/layouts/Home_layout_page.html';
import '../../ui/layouts/Home_layout_page.js';
import '../../ui/layouts/Blank_layout_page.html';

//import client page html

import '../../ui/pages/html/AddUser_page.html';
import '../../ui/pages/html/ChangePassword_page.html';
import '../../ui/pages/html/EditUserRole_page.html';
import '../../ui/pages/html/Login_page.html';
import '../../ui/pages/html/WebMap_page.html';
import '../../ui/pages/html/ZoneTabPane_body.html';
import '../../ui/pages/html/CommentModal_body.html';
import '../../ui/pages/html/DeniedAccess_page.html';
import '../../ui/pages/html/DeleteUser_page.html';
import '../../ui/pages/html/CountyTabPane_body.html'
import '../../ui/pages/html/LayersTabPane_body.html';
import '../../ui/pages/html/DownloadsTabPane_body.html';
import '../../ui/pages/html/SetPassword_page.html';
import '../../ui/pages/html/ScenarioTabPane_body.html';
import '../../ui/pages/html/CesiumPage.html';
import '../../ui/pages/html/InfoBody_page.html';
import '../../ui/pages/html/CesiumMap_page.html';
import '../../ui/pages/html/LayersMenu_body.html';
import '../../ui/pages/html/NavigationOptions_page.html'
import '../../ui/pages/html/Chloropleth_body.html';
import '../../ui/pages/html/FindZoneControl_body.html';
import '../../ui/pages/html/InfoModal_body.html';
import '../../ui/pages/html/ResultsControl_body.html';
import '../../ui/pages/html/OptionsControl_body.html';
import '../../ui/pages/html/Intro_page.html';
import '../../ui/pages/html/SlideShow_body.html';
//import client page js

import '../../ui/pages/js/AddUser_page.js';
import '../../ui/pages/js/ChangePassword_page.js';
import '../../ui/pages/js/EditUserRole_page.js';
import '../../ui/pages/js/Login_page.js';
import '../../ui/pages/js/WebMap_page.js';
import '../../ui/pages/js/ZoneTabPane_body.js';
import '../../ui/pages/js/DeleteUser_page.js';
import '../../ui/pages/js/CommentModal_body.js';
import '../../ui/pages/js/CountyTabPane_body.js';
import '../../ui/pages/js/LayersTabPane_body.js';
import '../../ui/pages/js/DownloadsTabPane_body.js';
import '../../ui/pages/js/SetPassword_page.js';
import '../../ui/pages/js/ScenarioTabPane_body.js';
import '../../ui/pages/js/CesiumPage.js';
import '../../ui/pages/js/CesiumMap_page.js';
import '../../ui/pages/js/LayersMenu_body.js';
import '../../ui/pages/js/NavigationOptions_page.js';
import '../../ui/pages/js/Chloropleth_body.js';
import '../../ui/pages/js/FindZoneControl_body.js';
import '../../ui/pages/js/InfoModal_body.js'
import '../../ui/pages/js/ResultsControl_body.js';
import '../../ui/pages/js/OptionsControl_body.js';
import '../../ui/pages/js/Intro_page.js';
import '../../ui/pages/js/SlideShow_body.js';
//declare routs


FlowRouter.route('/', {
    name: 'home',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'Intro_page'});
    }
});

FlowRouter.route('/cesium', {
    name: 'cesium',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'CesiumPage'});
    }
});

FlowRouter.route('/enroll-account/:token', {
    name:'setPassword',
    action: function(){
        BlazeLayout.render('Blank_layout_page', {main: 'SetPassword_page'});
    }
});

FlowRouter.route('/reset-password/:token', {
    name: 'resetPassword',
    action: function(){
        BlazeLayout.render('Blank_layout_page', {main:'SetPassword_page'})
    }
});

FlowRouter.route('/map', {
    name: 'webMap',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'WebMap_page'});
    }
});

FlowRouter.route('/3dmap', {
    name: '3dmap',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'CesiumMap_page'})
    }
});

AdminGroup = FlowRouter.group({
    prefix: '/admin'
});

AdminGroup.route('/adduser',{
    name: 'adminAddUser',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'AddUser_page'});
    }
});

AdminGroup.route('/changeroles', {
    name: 'changeRoles',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'EditUserRole_page'})
    }
});

AdminGroup.route('/changepassword', {
    name: 'changePassword',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'ChangePassword_page'})
    }
});

AdminGroup.route('/deleteuser', {
    name: 'deleteUser',
    action: function(){
        BlazeLayout.render('Home_layout_page', {main: 'DeleteUser_page'});
    }
});

