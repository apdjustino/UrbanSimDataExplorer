/**
 * Created by jmartinez on 10/10/16.
 */
if(Meteor.isClient){
    
    Template.vote_icon.helpers({
        vote_icon_args: function() {
            return {
                type: "accordion",
                data: [
                    {icon: "donut_large", headerText: "donut_large", active:"", body: "vote_body", bodyData:undefined},
                    {icon: "donut_small", headerText: "donut_small", active:"", body: "vote_body", bodyData:undefined},
                    {icon: "extension", headerText: "extension", active:"", body: "vote_body", bodyData:undefined},
                    {icon: "lightbulb_outline", headerText: "lightbulb_outline", active:"", body: "vote_body", bodyData:undefined},
                    {icon: "polymer", headerText: "polymer", active:"", body: "vote_body", bodyData:undefined},
                    {icon: "add_circle", headerText: "add_circle", active:"", body: "vote_body", bodyData:undefined},
                    {icon: "add_circle_outline", headerText: "add_circle_outline", active:"", body: "vote_body", bodyData:undefined}
                ]
            }
        }
    });
    
    
}