/**
 * Created by jmartinez on 8/15/16.
 */
if(Meteor.isClient){

    Template.OptionsControl_body.events({
        "change #chkMultiple": function(){
            if(event.target.checked){
                Session.set('allowMultipleGeo', true);
            }else{
                Session.set('allowMultipleGeo', false);
            }
        }
    })
    
}