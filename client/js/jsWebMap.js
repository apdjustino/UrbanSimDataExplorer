/**
 * Created by jmartinez on 2/16/2016.
 */
if(Meteor.isClient){

    Template.webMap.helpers({
        fields: function(){
            return fields.find({}).fetch();
        },
        years: function() {
            return [2015,2016,2017]
        }

    })

}