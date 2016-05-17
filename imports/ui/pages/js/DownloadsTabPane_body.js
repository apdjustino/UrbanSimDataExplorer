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
                hh_diff: "Households",
                pop_diff: "Population",
                median_income_diff: "Median Income",
                ru_diff: "Residential Unit Count",
                emp_diff: "Employment(All)",
                emp1_diff: "Education Employment",
                emp2_diff: "Entertainment Employment",
                emp3_diff: "Production Employment",
                emp4_diff: "Restaurant Employment",
                emp5_diff: "Retail Employment",
                emp6_diff: "Services Employment",
                nr_diff: "Non-Res SqFt",
                res_price_base: "Residential Price",
                non_res_price_base: "Non-Res Price",
                res_price_sim: "Residential Price",
                non_res_price_sim: "Non-Res Price",
                res_price_diff: "Residential Price",
                non_res_price_diff: "Non-Res Price",
                sim_density_zone: "Zonal Density",
                building_count: "Building Count",
                base_year_building_count: "Building Count"
            }];

            unparsed = Papa.unparse(data);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:attachment/csv,' + encodeURIComponent(unparsed);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'download.csv';
            hiddenElement.click();
        }
    });





}