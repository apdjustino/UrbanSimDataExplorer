/**
 * Created by jmartinez on 5/9/16.
 */
if(Meteor.isClient){

    
    Template.DownloadsTabPane_body.helpers({

    });
    
    
    Template.DownloadsTabPane_body.events({
        "click #btnDownload": function(event){
            event.preventDefault();
            var geo = $('#geographySelectDownload option:selected').val();
            var year = parseInt($('#yearSelectDownload option:selected').val());

            Meteor.call('downloadData', geo, year, function(error, result){
                if(error){
                    sAlert.error(error.reason, {position:'bottom'});
                }else{

                    var hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:attachment/csv,' + encodeURIComponent(result);
                    hiddenElement.target = '_blank';
                    hiddenElement.download = 'download.csv';
                    hiddenElement.click();

                }
            })

        }
    });





}