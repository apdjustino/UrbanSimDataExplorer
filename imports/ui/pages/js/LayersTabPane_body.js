/**
 * Created by jmartinez on 5/4/16.
 */
if(Meteor.isClient){
    
    Template.LayersTabPane_body.helpers({
        muniList: function(){
            var muniList = [
                'Idaho Springs',
                'Georgetown',
                'Silver Plume',
                'Empire',
                'Central City',
                'Superior',
                'Parker',
                'Lafayette',
                'Firestone',
                'Erie',
                'Denver',
                'Castle Rock',
                'Brighton',
                'Arvada',
                'Ward',
                'Jamestown',
                'Nederland',
                'Lyons',
                'Louisville',
                'Dacono',
                'Fort Lupton',
                'Frederick',
                'Hudson',
                'Keenesburg',
                'Lochbuie',
                'Platteville',
                'Northglenn',
                'Centennial',
                'Greenwood Village',
                'Thornton',
                'Boulder',
                'Commerce City',
                'Aurora',
                'Broomfield',
                'Glendale',
                'Deer Trail',
                'Bennett',
                'Cherry Hills Village',
                'Englewood',
                'Littleton',
                'Foxfield',
                'Sheridan',
                'Bow Mar',
                'Columbine Valley',
                'Federal Heights',
                'Morrison',
                'Lone Tree',
                'Black Hawk',
                'Longmont',
                'Mead',
                'Westminster',
                'Lakewood',
                'Larkspur',
                'Wheat Ridge',
                'Castle Pines',
                'Mountain View',
                'Lakeside',
                'Edgewater'
            ];
            return muniList.sort();
        }
    });

    Template.LayersTabPane_body.events({
        "click .muniChk": function(event){
            var checkedMunis = Session.get('checkedMunis');
            var city = $(event.target).val();
            if(event.target.checked){
                checkedMunis.push(city);
                d3.selectAll(".city").classed("citySelected", function(d){
                    return ($.inArray(d.properties['CITY'], checkedMunis) !== -1);
                });
            }else{
                checkedMunis = _.without(checkedMunis, city);
                d3.selectAll(".city").classed("citySelected", function(d){
                    return ($.inArray(d.properties['CITY'], checkedMunis) !== -1);
                });
            }
            Session.set('checkedMunis', checkedMunis)

        }, "change #bldLayerChk": function(event, template){
            if(!event.target.checked){
                d3.selectAll('.buildings').style('display', 'none');
            }else{
                d3.selectAll('.buildings').style('display', '');
            }
        }, "change #parcelLayerChk": function(){
            if(!event.target.checked){
                d3.selectAll('.parcels').style('display', 'none');
            }else{
                d3.selectAll('.parcels').style('display', '');
            }
        }
    });

    Template.LayersTabPane_body.onRendered(function(){
        Session.set('checkedMunis', []);
    })

}