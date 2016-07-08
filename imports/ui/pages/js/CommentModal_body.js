/**
 * Created by jmartinez on 4/18/16.
 */
if(Meteor.isClient){

    Comments.ui.config({
        template: 'bootstrap'
    });

    Template.CommentModal_body.helpers({
        commentId: function(measure, year, zone){
            return zone + '-' + measure + '-' + year;
            // return '448-ru_sim-2010'
        }, comment: function(commentId){
            return Comments.getCollection().find({reference_id: commentId}).fetch()
        }
    })
    
    
}