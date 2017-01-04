/**
 * Created by jmartinez on 1/4/17.
 */
if(Meteor.isClient){

    Template.Help_page.helpers({
        Help_options_args: function(){
            return {
                type: "accordion",
                data: [
                    {id: "FAQPane", icon: "help_outline", headerText: "FAQs", body: "FAQ_body", bodyData: undefined},
                    {id: "GuidePane", icon: "chat_bubble_outline", headerText: "How-To Guides", body: "Guide_body", bodyData:undefined}
                ]
            };
        }
    })


}