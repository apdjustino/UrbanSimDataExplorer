/**
 * Created by jmartinez on 4/5/16.
 */

export function getDataFields(admin){
    if(admin){
        return {zone_id:0, _id:0, sim_year:0, county_name: 0, county_id: 0, city_name: 0, NAME: 0};
    }else{
        return {
            zone_id:0,
            _id:0, 
            sim_year:0,
            median_income_sim:0,
            ru_sim: 0,
            emp1_sim: 0,
            emp2_sim: 0,
            emp3_sim: 0,
            emp4_sim: 0,
            emp5_sim: 0,
            emp6_sim: 0,
            nr_sim: 0,
            res_price_sim: 0,
            non_res_price_sim: 0,
            county_name: 0,
            county_id: 0,
            city_name: 0,
            NAME: 0
        }
    }
}



if(Meteor.isClient){

    export function getNavObject(navLinkId){
        var navObject = {
            navInfo: {
                icon: "info",
                title: "Info",
                nodes: [
                    {template: "InfoBody_page", data:undefined}
                ]
            }, navLogIn: {
                icon: "person",
                title: "Log In",
                nodes: [
                    {template: "CredentialsModal_body", data:undefined}
                ]
            }, navSignUp: {
                icon: "input",
                title: "Create New Account",
                nodes: [
                    {template: "SignUp_body", data:undefined}
                ]
            }, navLayers: {
                icon: "layers",
                title: "Layers",
                nodes: [
                    {template: "LayersMenu_body", data:undefined}
                ]
            }, addUser: {
                icon: "person",
                title: "Create New User",
                nodes: [
                    {template: "AddUser_page", data: undefined}
                ]
            }, editUser: {
                icon: "person",
                title: "Edit User Roles",
                nodes: [
                    {template: "EditUserRole_page", data: undefined}
                ]
            }, changeUserPass: {
                icon: "person",
                title: "Change User Password",
                nodes:[
                    {template: "ChangePassword_page", data: undefined}
                ]
            }, deleteUser: {
                icon: "person",
                title: "Delete User",
                nodes: [
                    {template: "DeleteUser_page", data: undefined}
                ]
            }
        };

        return navObject[navLinkId];
    }
    
    Template.registerHelper('GLOBAL_years', function(){
        return [2010,2015,2020,2025,2030,2035,2040]
    });
    
    Template.registerHelper('measureNameMap', function(abv){
        return measureNameMap(abv);
    });
    
    Template.registerHelper('formattedValue', function(val, measure){
        var format = d3.format(",.0f");
        return format(val)
    });
    
    Template.registerHelper('isSpinning', function(){
        return Session.get('spinning');
    });
    
    Template.registerHelper('SlideOut_args', function(id){
        return getNavObject(id);
    });
    
    Template.registerHelper('selectedNavItem', function(){
        return Session.get('selectedNavItem');
    });

    Template.registerHelper('is3dMap', function(){

        var mapName = FlowRouter.getRouteName();
        if(mapName != 'webMap'){
            return true;
        }else{
            return false;
        }

    });
    
    Template.registerHelper('parcelKeys', function(){
        parcelMap = {
            _Hospital: "Hospital",
            _Industria: "Industrial",
            _Transport: "Transportation",
            _Casino: "Casino",
            _Group_Qua: "Group Quarters",
            _Mixed_U_1: "Mixed Use Residential",
            _Parking: "Parking",
            _Military: "Military",
            _Condo: "Condo",
            _Open_Spac: "Open Space",
            _Restauran: "Restaurant",
            _Apartment: "Apartment",
            _Agricultu: "Agriultural",
            _Warehousi: "Warehousing",
            _Mixed_Use: "Mixed Use Non-Residential",
            _Office: "Office",
            _Mobile_Ho: "Mobile Home",
            _Retail: "Retail",
            _Townhome: "Townhome",
            _Quasi_pub: "Religious",
            _Recreatio: "Recreational",
            _School: "School",
            _Single_Fa: "Single Family Home",
            _Lodging: "Lodging"
        };
        
        return _.sortBy(_.keys(parcelMap), function(key){return key;});
        
    });

}

function measureNameMap(abv){
    var measureNames = {
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
        base_year_building_count: "Building Count",
        building_1: "Land Use Type",
        residentia: "Residential Units",
        non_reside: "Non Residential Sqft",
        bldg_sq_ft: "Total Bldg Sqft"
    };
    return measureNames[abv];
};

export function parcelKeys(){
    return {
        _Hospital: "Hospital",
        _Industria: "Industrial",
        _Transport: "Transportation",
        _Casino: "Casino",
        _Group_Qua: "Group Quarters",
        _Mixed_U_1: "Mixed Use Residential",
        _Parking: "Parking",
        _Military: "Military",
        _Condo: "Condo",
        _Open_Spac: "Open Space",
        _Restauran: "Restaurant",
        _Apartment: "Apartment",
        _Agricultu: "Agriultural",
        _Warehousi: "Warehousing",
        _Mixed_Use: "Mixed Use Non-Residential",
        _Office: "Office",
        _Mobile_Ho: "Mobile Home",
        _Retail: "Retail",
        _Townhome: "Townhome",
        _Quasi_pub: "Religious",
        _Recreatio: "Recreational",
        _School: "School",
        _Single_Fa: "Single Family Home",
        _Lodging: "Lodging"
    }; 
}

export { measureNameMap }