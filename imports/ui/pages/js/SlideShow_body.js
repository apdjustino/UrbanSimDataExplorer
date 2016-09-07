/**
 * Created by jmartinez on 9/6/16.
 */
if(Meteor.isClient){

    Template.SlideShow_body.events({
        "click #btnAddLocale": function(event, template){
            event.preventDefault();
            alert(Session.get('selectedZone'));
            Session.set('spinning', true);
            var locale = {
                uc_name: Session.get('selectedZone')
            };
            
            Meteor.call("findBuildingsInUc", locale['uc_name'][0], function(error, response){
                if(error){
                    Materialize.toast(error.reason, 4000)
                }else{
                    locale["baseData"] = response;
                    var years = [2040];
                    years.forEach(function(cv){
                        Meteor.call("findNewBuildingsInUc", locale['uc_name'], cv, function(error, response){
                            if(error){
                                Materialize.toast(error.reason, 4000);
                            }else{
                                locale["data_" + cv.toString()] = response;
                                Meteor.call('addNewLocale', locale);
                                Session.set('spinning', false);
                            }
                        });
                    });
                }
            });

            


            
        }, "click #btnAddShot": function(event, target){
            event.preventDefault();
            var position = viewer.camera.position;
            var name = Session.get('selectedZone');
            var shot = {x: position.x, y: position.y, z: position.z, heading: viewer.camera.heading, pitch: viewer.camera.pitch, roll:viewer.camera.roll};
            Meteor.call('addNewShot', name[0], shot);
        }
    })

}