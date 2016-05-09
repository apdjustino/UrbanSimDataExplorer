/**
 * Created by jmartinez on 5/9/16.
 */
if(Meteor.isClient){

    allZoneSub = undefined;
    allCountySub = undefined;


    Template.DownloadsTabPane_body.helpers({
        data: function(){
            var geo = Session.get('downloadGeography');
            var year = Session.get('downloadYear');
            var data = undefined;
            
            if(geo == 'zone'){
                data = zoneData.find({sim_year:year}).fetch();
            }else{
                data = countyData.find({sim_year:year}).fetch();
            }
            
            data = Papa.unparse(data);
            return encodeURIComponent(data);
        }, subIsReady: function(){
            if(Session.get('zoneSubIsReady') && Session.get('countySubIsReady')){
                return true;
            }else{
                return false;
            }
        }
    });
    
    
    Template.DownloadsTabPane_body.events({
        "change #yearSelectDownload": function(event){
            allZoneSub.stop();
            allCountySub.stop();

            Session.set('zoneSubIsReady', false);
            Session.set('countySubIsReady', false);
            Session.set('downloadYear', parseInt($('#yearSelectDownload option:selected').val()));
            
            allZoneSub = Meteor.subscribe('zones_by_year_all', Session.get('downloadYear'), {
                onReady: function(){
                    Session.set('zoneSubIsReady', true);
                }
            });
            allCountySub = Meteor.subscribe('counties_by_year_all', Session.get('downloadYear'), {
                onReady: function(){
                    Session.set('countySubIsReady', true);
                }
            });
        }, "change #geographySelectDownload": function(){
            Session.set('downloadGeography', $('#geographySelectDownload option:selected').val());
        }
    });



    Template.DownloadsTabPane_body.onRendered(function(){

        Session.set('downloadGeography', $('#geographySelectDownload option:selected').val());
        Session.set('downloadYear', parseInt($('#yearSelectDownload option:selected').val()));
        
    })

}