/**
 * Created by jmartinez on 4/5/16.
 */
import '../imports/startup/client/routes.js';
import '../imports/startup/client/mapFunctions.js';

if(Meteor.isClient){
    Meteor.startup(function(){
        Session.set('selectedZone', []);
        Session.set('allowMultipleGeo', false);
        
        viewer = undefined;
        CESIUM_BASE_URL = "/scripts/Cesium-1.23/Build/CesiumUnminified/";
        WebFontConfig = {
            google: {families: ['Lato:400', 'Lato:300', 'Mouse Memoirs']}
        };
        (function () {
            var wf = document.createElement('script');
            wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
            wf.type = 'text/javascript';
            wf.async = 'true';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(wf, s);
            console.log("async fonts loaded", WebFontConfig);
        })();

        var sub = Meteor.subscribe('users');

    })

}