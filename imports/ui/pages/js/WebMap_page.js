/**
 * Created by jmartinez on 4/5/16.
 */
import {drawMap} from '../../../startup/client/mapFunctions.js';
import {colorMap} from '../../../startup/client/mapFunctions.js';
import {drawChart} from '../../../startup/client/mapFunctions.js';
import {getDataFields} from '../../../ui/components/Global_helpers.js';
import { measureNameMap } from '../../../ui/components/Global_helpers.js';
import {findZoneData} from '../../../ui/components/CesiumMapFunctions.js';
import {findMuniData} from '../../../ui/components/CesiumMapFunctions.js';
import {subscribeToZone} from '../../../ui/components/CesiumMapFunctions.js';

if(Meteor.isClient){

    line = undefined;
    coordinates =[];
    counter = 0;
    
    Template.WebMap_page.helpers({
        selectedData: function(){
            return Session.get('selectedData');
        }, selectedZone: function(){
            return Session.get('selectedZone');
        }, buildingData: function(){
            return Template.instance().buildingData.get();
        }, commentMeasure: function(){
            return Session.get('commentMeasure');
        }, CommentModal_args: function(){
            var selectedYear = parseInt($('#yearSelectZone option:selected').val());
            var selectedZones = Session.get('selectedZone');
            var measure = Session.get('commentMeasure');
            
            return {
                modalId: 'commentModal',
                bodyTemplate: 'CommentModal_body',
                modalTitle: selectedYear + ' ' + measureNameMap(measure) + ' Comments for Zone(s): ' + selectedZones,
                modalData: {measure: measure, year: selectedYear, zone:selectedZones}
            }
            
        }, selectedLayer: function(){
            var layer = Session.get('selectedLayer');
            var layerMap = {
                zonesGeo: 'ZONES',
                municipalities: 'MUNICIPALITIES',
                county_web: 'COUNTIES',
                urban_centers: 'URBAN CENTERS'
            };
            
            return layerMap[layer];
        }, Options_args: function(){
            return {
                type: "accordion",
                data: [
                    {icon: "dashboard", headerText: "Chloropleth", active: "", body: "Chloropleth_body", bodyData: undefined},
                    {icon: "search", headerText: "Find", active: "", body: "FindZoneControl_body", bodyData: Session.get('selectedLayer')},
                    {icon: "settings", headerText: "Options", active: "", body: "OptionsControl_body", bodyData: undefined},
                    {icon: "view_list", headerText: "Results", active: "active", body: "ResultsControl_body", bodyData: Session.get('selectedData')}
                ]
            }
        }, CommentModal_args: function(){
            var measure = Session.get('commentMeasure');
            var year = Session.get('selectedYear');
            var zone = Session.get('selectedZone');

            return {
                modalId: "commentModal",
                bottom: "",
                modalHeader: year + " " + measureNameMap(measure) + " Comments for Zone(s): " + zone,
                modalHeaderTemplate: "CommentModal_header",
                modalBodyTemplate: "CommentModal_body",
                data: {measure: measure, year: year, zone: zone}
            }
        }
    });
    
    zoneComments = undefined;
    Template.WebMap_page.events({

        "click #toggleCharts": function(event, template){
            event.preventDefault();
            var toggle = template.chartToggle.get();
            toggle = !toggle;
            template.chartToggle.set(toggle);

            var htmlHeight = $(window).height();
            var navHeight = $('#primaryNav').height();
            var mapHeight = htmlHeight - navHeight;
            var el = document.getElementById('chartsContainer');
            var bounds = el.getBoundingClientRect();
            var containerHeight = bounds.bottom - bounds.top;
            var newTop = mapHeight - containerHeight;

            

            newTop = newTop.toString() + 'px';

            if(toggle){
                $('#chartsContainer').animate({'top': "-290px"}, 500);
            }else{
                $('#chartsContainer').animate({'top': '0px'}, 500);
            }


        }, "click #closeEditDiv": function(event, template){
            event.preventDefault();
            $('#editor').animate({'left': '125%'}, 250);

        }, "click .entity": function(event, template){
            var id = event.target.id;
            var entityId = id.split('-')[1];
            var year = Session.get('selectedYear');
            var layer = Session.get('selectedLayer');
            console.log(year);    
            if(layer == 'zonesGeo'){
                findZoneData(entityId, year);
                if(zoneComments){
                    zoneComments.stop();
                    zoneComments = Meteor.subscribe('commentsByZone', year);
                }else{
                    zoneComments = Meteor.subscribe('commentsByZone', year);
                }

                var selectedZoneArray = Session.get('selectedZone');
                d3.selectAll(".entity").classed("selected", function(d){
                    return ($.inArray(d.properties['ZONE_ID'], selectedZoneArray) !== -1);
                });
            }else if(layer == 'municipalities'){
                findMuniData(entityId, year);
                var selectedZoneArray = Session.get('selectedZone');
                d3.selectAll(".entity").classed("selected", function(d){
                    return ($.inArray(d.properties['CITY'], selectedZoneArray) !== -1);
                });
            }else{

            }


        }

    });
    
    Template.WebMap_page.onCreated(function(){
        this.chartToggle = new ReactiveVar(false);
        this.buildingData = new ReactiveVar(false);
        var self = this;
        this.autorun(function(){
            self.subscribe('counties', {
                onReady: function(){
                    var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');
                    var regionalChartData = _.keys(counties).map(function(key){
                        var simData = counties[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });

                    drawChart(regionalChartData);

                }
            });
        });
        
    });
    
    Template.WebMap_page.onRendered(function(){
        Session.set('selectedLayer', 'zonesGeo');
        Session.set('selectedYear', 2010);
        L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

        map = L.map("mapContainer").setView([39.75, -104.95], 10);
        var streets = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            id: 'mapbox.outdoors',
            accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
        });

        map.addLayer(streets);




        var zoneParams = {
            pathString: "/data/zonesGeo.json",
            obj_name: "zonesGeo",
            label_string: "ZoneId: ",
            geo_property: "ZONE_ID",
            tazId: "TAZ_ID",
            geo_class: "entity"
        };
        drawMap(zoneParams);
    })

}

