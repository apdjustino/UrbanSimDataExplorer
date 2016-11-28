/**
 * Created by jmartinez on 6/29/16.
 */
Meteor.methods({
    findParcels: function(ids){
        return parcels.find({'properties.parcel_id': {$in: ids}}).fetch();
    }, getParcelsInZone: function(zoneId){
        return parcels.find({'properties.zone_id': zoneId}).fetch();
    }, findParcelsInUc: function(NAME){
        var b = buildings.find({'properties._uc_name': NAME}, {fields:{'properties._parcel_id':1}}).fetch();
        b = b.map(function(x){ return x.properties._parcel_id});
        return parcels.find({'properties.parcel_id': {$in: b}}).fetch();
    }
});


