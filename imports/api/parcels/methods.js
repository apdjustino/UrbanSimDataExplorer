/**
 * Created by jmartinez on 6/29/16.
 */
Meteor.methods({
    findParcels: function(ids){
        return parcels.find({'properties.parcel_id': {$in: ids}}).fetch();
    }, getParcelsInZone: function(zoneId){
        return parcels.find({'properties.zone_id': zoneId}).fetch();
    }
});