/**
 * Created by jmartinez on 4/5/16.
 */
import '../imports/startup/client/routes.js';
import '../imports/startup/client/mapFunctions.js';
import '../imports/ui/components/CesiumMapFunctions.js';
import {subscribeToCounty} from '../imports/ui/components/CesiumMapFunctions.js';

if(Meteor.isClient){
    Meteor.startup(function(){
        Session.set('selectedZone', []);
        Session.set('allowMultipleGeo', false);
        Session.set("selectedLayer", "noLayer");
        
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

        var countySub = Meteor.subscribe('counties');
        var allCounties = ['Boulder', 'Broomfield', 'Denver', 'Adams', 'Arapahoe', 'Douglas', 'Jefferson', 'Weld', 'Gilpin', 'Clear Creek', 'Elbert'];
        subscribeToCounty(2010, allCounties);

    })

}