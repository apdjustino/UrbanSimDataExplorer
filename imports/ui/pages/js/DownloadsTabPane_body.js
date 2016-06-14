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

        }, "click #btnDataDictionary": function(event){
            event.preventDefault();
            var data = [{
                zone_id: "Zone ID",
                hh_base: "Households",
                pop_base:"Population",
                median_income_base: "Median Income",
                ru_base: "Residential Unit Count",
                emp_base:"Employment(All)",
                emp1_base: "Education Employment",
                emp2_base: "Entertainment Employment",
                emp3_base: "Production Employment",
                emp4_base: "Restaurant Employment",
                emp5_base: "Retail Employment",
                emp6_base: "Services Employment",
                nr_base: "Non-Res SqFt",
                hh_sim: "Households",
                pop_sim: "Population",
                median_income_sim: "Median Income",
                ru_sim: "Residential Unit Count",
                emp_sim: "Employment(All)",
                emp1_sim: "Education Employment",
                emp2_sim: "Entertainment Employment",
                emp3_sim: "Production Employment",
                emp4_sim: "Restaurant Employment",
                emp5_sim: "Retail Employment",
                emp6_sim: "Services Employment",
                nr_sim: "Non-Res SqFt",
                res_price_base: "Residential Price",
                non_res_price_base: "Non-Res Price",
                res_price_sim: "Residential Price",
                non_res_price_sim: "Non-Res Price",
            }];

            Meteor.call('dataDictionary', function(error, result){
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
        }, "click #btnTestPython": function(event){
            event.preventDefault();
            Meteor.call('testPython', function(error, response){
                if(error){
                    alert(error.reason);
                }else{
                    alert(response);
                }
            });
        }
    });





}