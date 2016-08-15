/**
 * Created by jmartinez on 4/5/16.
 */
import {loadCesiumMap} from '../../components/CesiumMapFunctions.js';
import {drawChart} from '../../../startup/client/mapFunctions.js';
import {getDataFields} from '../../../ui/components/Global_helpers.js';
import { measureNameMap } from '../../../ui/components/Global_helpers.js';


if(Meteor.isClient){

    line = undefined;
    coordinates =[];
    counter = 0;
    
    Template.WebMap_page.helpers({
        selectedData: function(){
            return Session.get('selectedData');
        }, selectedAreas: function(){
            return Session.get('selectedZone');
        }, isSpinning: function(){
            return Session.get('spinning');
        }, Tab_args: function(){
            var tabData = [
                {id: 'zoneResults', name: 'Zones', body: 'ZoneTabPane_body', data: undefined},
                {id: 'countyResults', name: 'Counties', body: 'CountyTabPane_body', data: undefined},
                {id: 'cityResults', name: 'Cities', body: '', data: undefined},
                {id: 'ucResults', name: 'Urban Centers', body: '', data: undefined},
                {id: 'downloads', name: 'Downloads', body: 'DownloadsTabPane_body', data: undefined}
            ];
            return {
                tabs: tabData
            };
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
        }
    });
    
    zoneComments = undefined;
    Template.WebMap_page.events({
        "click #btnReset":function(event, template) {

        }, "click #countyResults-li": function(event, template){

        }, "click #zoneResults-li": function(event, template){

        },  "click #downloads-li": function(event){
            event.preventDefault();
        }, "click #toggleCharts": function(event, template){
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
                $('#chartsContainer').animate({'top': newTop}, 500);
            }else{
                $('#chartsContainer').animate({'top': '100%'}, 500);
            }


        }, "click #closeEditDiv": function(event, template){
            event.preventDefault();
            $('#editor').animate({'left': '125%'}, 250);

        }, "click #scenarios-li": function(event, template){
            
        }

    });


    Template.WebMap_page.onRendered(function(){

        $('#myTab li').first().addClass('active');
        $('.tab-pane').first().addClass('active');
        
    });

    Template.WebMap_page.onCreated(function(){
        this.chartToggle = new ReactiveVar(false);
        this.buildingData = new ReactiveVar(false);
        
    });
    
    Template.WebMap_page.onRendered(function(){
        Session.set('selectedLayer', 'zonesGeo');
        Session.set('selectedYear', 2010);
        $.getScript('/scripts/Cesium-1.23/Build/CesiumUnminified/Cesium.js', function(){
            loadCesiumMap();
        })
    })

}

