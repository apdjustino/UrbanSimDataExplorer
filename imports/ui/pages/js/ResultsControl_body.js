/**
 * Created by jmartinez on 8/15/16.
 */
if(Meteor.isClient){
    
    Template.ResultsControl_body.helpers({
        hasData: function(){
            if(Session.equals('selectedData', undefined)){
                return false;
            }else{
                return true;
            }
        }
    })
    
}