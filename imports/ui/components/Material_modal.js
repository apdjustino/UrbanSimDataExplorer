/**
 * Created by jmartinez on 8/11/16.
 */
if(Meteor.isClient){
    
    Template.Material_modal.onRendered(function(){
        $('.modal-trigger').leanModal();
    })
    
}