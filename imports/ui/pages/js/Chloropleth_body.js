/**
 * Created by jmartinez on 8/8/16.
 */
if(Meteor.isClient){
    
    Template.Chloropleth_body.helpers({
        YearSelect_args: function(){
            return {
                multiple: "",
                selectId: "yearSelect",
                selectData: [
                    {value: 2010, name: 2010},
                    {value: 2015, name: 2015},
                    {value: 2020, name: 2020},
                    {value: 2025, name: 2025},
                    {value: 2030, name: 2030},
                    {value: 2035, name: 2035},
                    {value: 2040, name: 2040}

                ], label: "Year"
            }
        }, VariableSelect_args: function(){
            var data;
            if(Roles.userIsInRole(Meteor.userId(), ['admin'])){
                data = [
                    {value: 'hh_sim', name: 'Households'},
                    {value: 'pop_sim', name: 'Population'},
                    {value: 'median_income_sim', name: 'Median Income'},
                    {value: 'ru_sim', name: 'Residential Unit Count'},
                    {value: 'emp_sim', name: 'Employment(All)'},
                    {value: 'emp1_sim', name: 'Education Employment'},
                    {value: 'emp2_sim', name: 'Entertainment Employment'},
                    {value: 'emp3_sim', name: 'Production Employment'},
                    {value: 'emp4_sim', name: 'Restaurant Employment'},
                    {value: 'emp5_sim', name: 'Retail Employment'},
                    {value: 'emp6_sim', name: 'Services Employment'},
                    {value: 'nr_sim', name: 'Non-Res SqFt'},
                    {value: 'res_price_sim', name: 'Residential Price'},
                    {value: 'non_res_price_sim', name: 'Non-Res Price'}
                ];
            }else{
                data = [
                    {value: 'hh_sim', name: 'Households'},
                    {value: 'pop_sim', name: 'Population'},
                    {value: 'emp_sim', name: 'Employment'}
                ];
            }
            return {
                multiple: "",
                selectId: "variableSelect",
                label: "Variable",
                selectData: data
            }
        }
    })
    
}