/**
 * Created by jmartinez on 8/11/16.
 */
import {getDataFields} from '../components/Global_helpers.js';
if(Meteor.isClient){
    hand = undefined;
    export function loadCesiumMap() {
        Session.set('spinning', true);
        var west = -105.5347;
        var south = 39.2663;
        var east = -104.4301;
        var north = 40.246;
        var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

        Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;


        var imageryViewModels = [];
        imageryViewModels.push(new Cesium.ProviderViewModel({
            name: "Mapbox Streets",
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/mapboxStreets.png'),
            tooltip: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            creationFunction: function(){
                return new Cesium.MapboxImageryProvider({
                    mapId: 'mapbox.outdoors',
                    accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                })
            }
        }));

        imageryViewModels.push(new Cesium.ProviderViewModel({
            name: "Mapbox Satellite",
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/mapboxSatellite.png'),
            tooltip: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            creationFunction: function(){
                return new Cesium.MapboxImageryProvider({
                    mapId: 'mapbox.streets-satellite',
                    accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                })
            }
        }));


        viewer = new Cesium.Viewer('cesiumContainer', {
            infoBox: false,
            selectionIndicator: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: true,
            sceneModePicker: false,
            timeline: false,
            navigationHelpButton: true,
            navigationInstructionsInitiallyVisibile: false,
            animation: false,
            baseLayerPicker: true,
            selectedImageryProviderViewModel: imageryViewModels[0]

        });


        viewer.baseLayerPicker.viewModel.imageryProviderViewModels = imageryViewModels;
        viewer.baseLayerPicker.viewModel.terrainProviderViewModels = [];
        viewer.selectedImageryProviderViewModel = imageryViewModels[0];



        viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
        viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
        viewer.scene.screenSpaceCameraController.inertiaZoom = 0;


        viewer.dataSources.removeAll(true);
        var promise = Cesium.GeoJsonDataSource.load('/data/zonesGeo.json', {
            stroke: Cesium.Color.BLACK,
            fill: new Cesium.Color(0.01,0.01,0.01,0.01)
        });
        promise.then(function(dataSource){
            viewer.dataSources.add(dataSource);
            Session.set('spinning', false);
        }).otherwise(function(error){
            //Display any errrors encountered while loading.
            window.alert(error);
        });

        hand = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        setZoneClickEvents();

    }

    zoneComments = undefined;



    export function setZoneClickEvents() {
        //remove existing input action function from the global handler
        hand.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        hand.setInputAction(function(click){

            var pickedObject = viewer.scene.pick(click.position);
            var entity = pickedObject.id;
            //check if building is being clicked
            if(entity.properties.hasOwnProperty('Building_I')){

                for(i=1; i<viewer.dataSources.length; i++){
                    //start at index 1 because index 0 is going to be the polygon shapes of the layer
                    var dataSource = viewer.dataSources.get(i);
                    dataSource.entities.values.forEach(function(cv){
                        if(cv.properties._parcel_id == entity.properties._parcel_id){
                            cv.polygon.material = Cesium.Color.BLUE;
                            cv.polygon.outlineColor = Cesium.Color.BLUE;
                        }else{
                            cv.polygon.material = Cesium.Color.BURLYWOOD;
                            cv.polygon.outlineColor = Cesium.Color.BLACK;
                            cv.polygon.outlineWidth = 1.0
                        }

                    });
                }


                var resultData = [
                    {measure: 'pop_sim', value: entity.properties._pop_sim, diff: 0},
                    {measure: 'hh_sim', value: entity.properties._hh_sim, diff: 0},
                    {measure: 'emp_sim', value: entity.properties._emp_sim, diff: 0},
                    {measure: 'building_1', value: entity.properties._building_, diff:0}
                ];
                var selectedData = Session.get('selectedData');
                selectedData.oneYear = resultData;
                Session.set('selectedData', selectedData);
                Session.set('oldEntityId', entity.id);
                return;
            }

            //this code runs if user click on a zone polygon
            var zoneId = entity.properties.ZONE_ID;
            var selectedZones = Session.get('selectedZone');

            if(Session.equals('showBuildings', true)){
                Session.set('spinning', true);
                Meteor.call('findBuldingsInZone', zoneId, function(error, response){
                    if(error){
                        Materialize.toast(error.reason, 4000);
                    }else{
                        var year = Session.get('selectedYear');
                        var source = new Cesium.GeoJsonDataSource('src-'+ zoneId);
                        var new_source = new Cesium.GeoJsonDataSource('newBuildings');
                        if(Session.equals('allowMultipleGeo', false)){
                            if(selectedZones.length > 0){
                                Session.set('spinning', false);
                                var dataSourcesCount = viewer.dataSources.length - 1;
                                for(var i=dataSourcesCount; i> 0; i--){
                                    viewer.dataSources.remove(viewer.dataSources.get(i), true);
                                }
                                if(zoneId != selectedZones[0]){

                                    viewer.dataSources.add(source);
                                    addSource(source, response);

                                    if(year != 2010){
                                        Meteor.call('findNewBuildingsInZone', [zoneId], year, function(error, res){
                                            if(error){
                                                Materialize.toast(error.reason, 4000);
                                            }else{
                                                viewer.dataSources.add(new_source);
                                                addNewBuildings(new_source, res, year);
                                            }
                                        });
                                    }

                                }
                            }else{
                                viewer.dataSources.add(source);
                                addSource(source, response);

                                if(year != 2010){
                                    Meteor.call('findNewBuildingsInZone', [zoneId], year, function(error, res){
                                        if(error){
                                            Materialize.toast(error.reason, 4000);
                                        }else{
                                            viewer.dataSources.add(new_source);
                                            addNewBuildings(new_source, res, year);
                                        }
                                    });
                                }
                            }
                        }else{
                            if(_.contains(selectedZones, zoneId)){
                                viewer.dataSources._dataSources.forEach(function(src, idx){
                                    Session.set('spinning', false);
                                    if(src._name.split('-')[1] == zoneId.toString()){
                                        viewer.dataSources.remove(viewer.dataSources.get(idx), true);
                                    }
                                });
                            }else{
                                viewer.dataSources.add(source);
                                addSource(source, response);
                                if(year != 2010){
                                    Meteor.call('findNewBuildingsInZone', [zoneId], year, function(error, res){
                                        if(error){
                                            Materialize.toast(error.reason, 4000);
                                        }else{
                                            viewer.dataSources.add(new_source);
                                            addNewBuildings(new_source, res, year);
                                        }
                                    });
                                }
                            }
                        }

                    }
                });
            }else{
                //this block of code deals with setting the color of the clicked zone and the color of the unclicked zone
                //it accounts for if the chloropleth is active
                if(Session.equals('allowMultipleGeo', false)){
                    if(selectedZones.length > 0){
                        viewer.entities.removeAll();

                        if(zoneId != selectedZones[0]){
                            viewer.entities.add({
                                polygon: {
                                    hierarchy: entity.polygon.hierarchy,
                                    material: new Cesium.Color(1,1,0, .7)
                                }
                            });
                        }
                    }else{
                        viewer.entities.add({
                            polygon: {
                                hierarchy: entity.polygon.hierarchy,
                                material: new Cesium.Color(1,1,0, .7)
                            }
                        });
                    }

                }else{
                    if(_.contains(selectedZones, zoneId)){
                        var drillPick = viewer.scene.drillPick(click.position);
                        var topEntity = drillPick[drillPick.length -1].id;
                        viewer.entities.remove(topEntity);
                    }else{
                        viewer.entities.add({
                            polygon: {
                                hierarchy: entity.polygon.hierarchy,
                                material: new Cesium.Color(1,1,0,1, .7)
                            }
                        });
                    }

                }
            }

            var year = Session.get('selectedYear');
            if(Session.equals('allowMultipleGeo', false) && Session.equals('selectedLayer', 'zonesGeo')){
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(entity.properties.Long, entity.properties.Lat - .0005, 3200),
                    duration: 2,
                    complete: function(){
                        if(Session.equals('selectedLayer', 'zonesGeo')){
                            findZoneData(zoneId, year);
                            if(zoneComments){
                                zoneComments.stop();
                                zoneComments = Meteor.subscribe('commentsByZone', year);
                            }else{
                                zoneComments = Meteor.subscribe('commentsByZone', year);
                            }
                        }

                    }
                });
            }else{
                findZoneData(zoneId, year);
                if(zoneComments){
                    zoneComments.stop();
                    zoneComments = Meteor.subscribe('commentsByZone', year);
                }else{
                    zoneComments = Meteor.subscribe('commentsByZone', year);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    export function setCityClickEvents(){
        hand.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        hand.setInputAction(function(click){

            var pickedObject = viewer.scene.pick(click.position);
            var entity = pickedObject.id;
            var city_name = entity.properties.CITY;


            var selectedZones = Session.get('selectedZone');

            //this block of code deals with setting the color of the clicked zone and the color of the unclicked zone
            //it accounts for if the chloropleth is active
            if(Session.equals('allowMultipleGeo', false)){
                if(selectedZones.length > 0){
                    viewer.entities.removeAll();

                    if(city_name != selectedZones[0]){
                        viewer.entities.add({
                            polygon: {
                                hierarchy: entity.polygon.hierarchy,
                                material: new Cesium.Color(1,1,0, .7)
                            }
                        });
                    }
                }else{
                    viewer.entities.add({
                        polygon: {
                            hierarchy: entity.polygon.hierarchy,
                            material: new Cesium.Color(1,1,0, .7)
                        }
                    });
                }

            }else{
                if(_.contains(selectedZones, city_name)){
                    var drillPick = viewer.scene.drillPick(click.position);
                    var topEntity = drillPick[drillPick.length -1].id;
                    viewer.entities.remove(topEntity);
                }else{
                    viewer.entities.add({
                        polygon: {
                            hierarchy: entity.polygon.hierarchy,
                            material: new Cesium.Color(1,1,0,1, .7)
                        }
                    });
                }

            }

            var year = Session.get('selectedYear');

            findMuniData(city_name, year);


            // if(zoneComments){
            //     zoneComments.stop();
            //     zoneComments = Meteor.subscribe('commentsByZone', year);
            // }else{
            //     zoneComments = Meteor.subscribe('commentsByZone', year);
            // }




        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    export function setCountyClickEvents(){
        hand.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        hand.setInputAction(function(click){

            var pickedObject = viewer.scene.pick(click.position);
            var entity = pickedObject.id;
            var county_name = entity.properties.COUNTY;


            var selectedZones = Session.get('selectedZone');

            //this block of code deals with setting the color of the clicked zone and the color of the unclicked zone
            //it accounts for if the chloropleth is active
            if(Session.equals('allowMultipleGeo', false)){
                if(selectedZones.length > 0){
                    viewer.entities.removeAll();

                    if(county_name != selectedZones[0]){
                        viewer.entities.add({
                            polygon: {
                                hierarchy: entity.polygon.hierarchy,
                                material: new Cesium.Color(1,1,0, .7)
                            }
                        });
                    }
                }else{
                    viewer.entities.add({
                        polygon: {
                            hierarchy: entity.polygon.hierarchy,
                            material: new Cesium.Color(1,1,0, .7)
                        }
                    });
                }

            }else{
                if(_.contains(selectedZones, county_name)){
                    var drillPick = viewer.scene.drillPick(click.position);
                    var topEntity = drillPick[drillPick.length -1].id;
                    viewer.entities.remove(topEntity);
                }else{
                    viewer.entities.add({
                        polygon: {
                            hierarchy: entity.polygon.hierarchy,
                            material: new Cesium.Color(1,1,0,1, .7)
                        }
                    });
                }

            }

            var year = Session.get('selectedYear');

            findCountyData(county_name, year);

            // if(zoneComments){
            //     zoneComments.stop();
            //     zoneComments = Meteor.subscribe('commentsByZone', year);
            // }else{
            //     zoneComments = Meteor.subscribe('commentsByZone', year);
            // }




        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    export function setUrbanCenterClickEvents(){
        hand.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        hand.setInputAction(function(click){

            var pickedObject = viewer.scene.pick(click.position);
            var entity = pickedObject.id;
            if(entity.properties.hasOwnProperty('Building_I')){

                for(i=1; i<viewer.dataSources.length; i++){
                    //start at index 1 because index 0 is going to be the polygon shapes of the layer
                    var dataSource = viewer.dataSources.get(i);
                    dataSource.entities.values.forEach(function(cv){
                        if(cv.properties._parcel_id == entity.properties._parcel_id){
                            cv.polygon.material = Cesium.Color.BLUE;
                            cv.polygon.outlineColor = Cesium.Color.BLUE;
                        }else{
                            cv.polygon.material = Cesium.Color.BURLYWOOD;
                            cv.polygon.outlineColor = Cesium.Color.BLACK;
                            cv.polygon.outlineWidth = 1.0
                        }

                    });
                }


                var resultData = [
                    {measure: 'pop_sim', value: entity.properties._pop_sim, diff: 0},
                    {measure: 'hh_sim', value: entity.properties._hh_sim, diff: 0},
                    {measure: 'emp_sim', value: entity.properties._emp_sim, diff: 0},
                    {measure: 'building_1', value: entity.properties._building_, diff:0}
                ];
                var selectedData = Session.get('selectedData');
                selectedData.oneYear = resultData;
                Session.set('selectedData', selectedData);
                Session.set('oldEntityId', entity.id);
                return;
            }
            var NAME = entity.properties.NAME;
            var selectedZones = Session.get('selectedZone');

            if(Session.equals('showBuildings', true)){
                Session.set('spinning', true);
                Meteor.call('findBuildingsInUc', NAME, function(error, response){
                    if(error){
                        Materialize.toast(error.reason, 4000);
                    }else{
                        var year = Session.get('selectedYear');
                        var source = new Cesium.GeoJsonDataSource('src-'+ NAME);
                        var new_source = new Cesium.GeoJsonDataSource('newBuildings');
                        if(Session.equals('allowMultipleGeo', false)){
                            if(selectedZones.length > 0){
                                Session.set('spinning', false);
                                var dataSourcesCount = viewer.dataSources.length - 1;
                                for(var i=dataSourcesCount; i> 0; i--){
                                    viewer.dataSources.remove(viewer.dataSources.get(i), true);
                                }
                                if(NAME != selectedZones[0]){

                                    viewer.dataSources.add(source);
                                    addSource(source, response);

                                    if(year != 2010){
                                        Meteor.call('findNewBuildingsInUc', [NAME], year, function(error, res){
                                            if(error){
                                                Materialize.toast(error.reason, 4000);
                                            }else{
                                                viewer.dataSources.add(new_source);
                                                addNewBuildings(new_source, res, year);
                                            }
                                        });
                                    }

                                }
                            }else{
                                viewer.dataSources.add(source);
                                addSource(source, response);

                                if(year != 2010){
                                    Meteor.call('findNewBuildingsInZone', [NAME], year, function(error, res){
                                        if(error){
                                            Materialize.toast(error.reason, 4000);
                                        }else{
                                            viewer.dataSources.add(new_source);
                                            addNewBuildings(new_source, res, year);
                                        }
                                    });
                                }
                            }
                        }else{
                            if(_.contains(selectedZones, NAME)){
                                viewer.dataSources._dataSources.forEach(function(src, idx){
                                    Session.set('spinning', false);
                                    if(src._name.split('-')[1] == NAME.toString()){
                                        viewer.dataSources.remove(viewer.dataSources.get(idx), true);
                                    }
                                });
                            }else{
                                viewer.dataSources.add(source);
                                addSource(source, response);
                                if(year != 2010){
                                    Meteor.call('findNewBuildingsInUc', [NAME], year, function(error, res){
                                        if(error){
                                            Materialize.toast(error.reason, 4000);
                                        }else{
                                            viewer.dataSources.add(new_source);
                                            addNewBuildings(new_source, res, year);
                                        }
                                    });
                                }
                            }
                        }

                    }
                });
            }else{
                //this block of code deals with setting the color of the clicked zone and the color of the unclicked zone
                //it accounts for if the chloropleth is active
                if(Session.equals('allowMultipleGeo', false)){
                    if(selectedZones.length > 0){
                        viewer.entities.removeAll();

                        if(NAME != selectedZones[0]){
                            viewer.entities.add({
                                polygon: {
                                    hierarchy: entity.polygon.hierarchy,
                                    material: new Cesium.Color(1,1,0, .7)
                                }
                            });
                        }
                    }else{
                        viewer.entities.add({
                            polygon: {
                                hierarchy: entity.polygon.hierarchy,
                                material: new Cesium.Color(1,1,0, .7)
                            }
                        });
                    }

                }else{
                    if(_.contains(selectedZones, NAME)){
                        var drillPick = viewer.scene.drillPick(click.position);
                        var topEntity = drillPick[drillPick.length -1].id;
                        viewer.entities.remove(topEntity);
                    }else{
                        viewer.entities.add({
                            polygon: {
                                hierarchy: entity.polygon.hierarchy,
                                material: new Cesium.Color(1,1,0,1, .7)
                            }
                        });
                    }

                }
            }






            var year = Session.get('selectedYear');
            findUrbanCenterData(NAME, year);


            // if(zoneComments){
            //     zoneComments.stop();
            //     zoneComments = Meteor.subscribe('commentsByZone', year);
            // }else{
            //     zoneComments = Meteor.subscribe('commentsByZone', year);
            // }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    export function findZoneData(zoneId, year){
        var selectedZoneArray = Session.get('selectedZone');
        if(!selectedZoneArray){
            selectedZoneArray = [];
        }
        if($.inArray(parseInt(zoneId), selectedZoneArray) !== -1){
            selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == zoneId;}));
        }else{
            if(Session.get('allowMultipleGeo') == false){
                selectedZoneArray = [parseInt(zoneId)];
            }else{
                selectedZoneArray.push(parseInt(zoneId));
            }

        }


        Session.set('selectedZone', selectedZoneArray);
        var zoneSubscription = subscribeToZone(year, selectedZoneArray);
    }

    export function findMuniData(city_name, year){
        var selectedZoneArray = Session.get('selectedZone');
        if(!selectedZoneArray){
            selectedZoneArray = [];
        }
        if($.inArray(city_name, selectedZoneArray) !== -1){
            selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == city_name;}));
        }else{
            if(Session.get('allowMultipleGeo') == false){
                selectedZoneArray = [city_name];
            }else{
                selectedZoneArray.push(city_name);
            }

        }


        Session.set('selectedZone', selectedZoneArray);
        var citySubscription = subscribeToCity(year, selectedZoneArray);
    }

    export function findCountyData(county_name, year){
        var selectedZoneArray = Session.get('selectedZone');
        if(!selectedZoneArray){
            selectedZoneArray = [];
        }
        if($.inArray(county_name, selectedZoneArray) !== -1){
            selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == county_name;}));
        }else{
            if(Session.get('allowMultipleGeo') == false){
                selectedZoneArray = [county_name];
            }else{
                selectedZoneArray.push(county_name);
            }

        }


        Session.set('selectedZone', selectedZoneArray);
        var countySubscription = subscribeToCounty(year, selectedZoneArray);
    }

    export function findUrbanCenterData(name, year){
        var selectedZoneArray = Session.get('selectedZone');
        if(!selectedZoneArray){
            selectedZoneArray = [];
        }
        if($.inArray(name, selectedZoneArray) !== -1){
            selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == name;}));
        }else{
            if(Session.get('allowMultipleGeo') == false){
                selectedZoneArray = [name];
            }else{
                selectedZoneArray.push(name);
            }

        }


        Session.set('selectedZone', selectedZoneArray);
        var ucSubscription = subscribeToUrbanCenter(year, selectedZoneArray);
    }

    export function subscribeToZone(year, selectedZoneArray){
        return Meteor.subscribe('grouped_zones', year, selectedZoneArray, {
            onReady: function(){

                var data;
                var baseData;
                var fieldObj = getDataFields(Roles.userIsInRole(Meteor.userId(), ['admin']));

                if(Session.get('selectedZone').length > 0){
                    data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                    baseData = zoneData.find({sim_year: 2010, zone_id:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                }else{
                    data = countyData.find({sim_year: year}, {fields:fieldObj}).fetch();
                    baseData = countyData.find({sim_year: 2010}, {fields:fieldObj}).fetch();
                }


                this.stop();
                var dataArr =[];

                //functional programming way of creating the right data object
                if(data.length > 0){
                    dataArr = _.keys(data[0]).map(function(key){
                        var value = data.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        var baseValue = baseData.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        return {measure: key, value:parseInt(value[key]), diff: parseInt(value[key]) - parseInt(baseValue[key])};
                    });
                }


                var dataDict = {};
                var chartData;



                dataDict["oneYear"] = _.sortBy(dataArr, 'measure').reverse();
                var allYears = _.groupBy(zoneData.find().fetch(), 'sim_year');
                var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');


                //this if statement determines if the chart draws the generic all region series
                //or the series for that particular zone. selectedZone will be length 0 when nothing is selected
                if(Session.get('selectedZone').length > 0){
                    chartData = _.keys(allYears).map(function(key){
                        var simData = allYears[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }else{
                    chartData = _.keys(counties).map(function(key){
                        var simData = counties[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }



                dataDict["allYears"] = chartData;
                Session.set("selectedData", dataDict);


                drawChart(dataDict.allYears);

            }
        });
    }

    export function subscribeToCity(year, selectedZoneArray){
        return Meteor.subscribe('grouped_cities', selectedZoneArray, {
            onReady: function(){

                var data;
                var baseData;
                var fieldObj = getDataFields(Roles.userIsInRole(Meteor.userId(), ['admin']));

                if(Session.get('selectedZone').length > 0){
                    data = muniSummary.find({sim_year: year, city_name:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                    baseData = muniSummary.find({sim_year: 2010, city_name:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                }else{
                    data = countyData.find({sim_year: year}, {fields:fieldObj}).fetch();
                    baseData = countyData.find({sim_year: 2010}, {fields:fieldObj}).fetch();
                }


                this.stop();
                var dataArr =[];

                //functional programming way of creating the right data object
                if(data.length > 0){
                    dataArr = _.keys(data[0]).map(function(key){
                        var value = data.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        var baseValue = baseData.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        return {measure: key, value:parseInt(value[key]), diff: parseInt(value[key]) - parseInt(baseValue[key])};
                    });
                }


                var dataDict = {};
                var chartData;



                dataDict["oneYear"] = _.sortBy(dataArr, 'measure').reverse();
                var allYears = _.groupBy(muniSummary.find({city_name:{$in:selectedZoneArray}}).fetch(), 'sim_year');
                var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');


                //this if statement determines if the chart draws the generic all region series
                //or the series for that particular zone. selectedZone will be length 0 when nothing is selected
                if(Session.get('selectedZone').length > 0){
                    chartData = _.keys(allYears).map(function(key){
                        var simData = allYears[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        console.log(simData);
                        return simData;
                    });
                }else{
                    chartData = _.keys(counties).map(function(key){
                        var simData = counties[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });

                        return simData;
                    });
                }



                dataDict["allYears"] = chartData;
                Session.set("selectedData", dataDict);


                drawChart(dataDict.allYears);

            }
        });
    }

    export function subscribeToCounty(year, selectedZoneArray){
        return Meteor.subscribe('grouped_counties', selectedZoneArray, {
            onReady: function(){
                var fieldObj = getDataFields(Roles.userIsInRole(Meteor.userId(), ['admin']));
                var data;
                var baseData;
                if(Session.get('selectedZone').length > 0){
                    data = countyData.find({sim_year: year, county_name:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                    baseData = countyData.find({sim_year: 2010, county_name:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                }else{
                    data = countyData.find({sim_year: year}, {fields:fieldObj}).fetch();
                    baseData = countyData.find({sim_year: 2010}, {fields:fieldObj}).fetch();
                }


                console.log(data);

                this.stop();
                var dataArr =[];

                //functional programming way of creating the right data object
                if(data.length > 0){
                    dataArr = _.keys(data[0]).map(function(key){
                        var value = data.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        var baseValue = baseData.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        return {measure: key, value:parseInt(value[key]), diff: parseInt(value[key]) - parseInt(baseValue[key])};
                    });
                }


                var dataDict = {};
                var chartData;



                dataDict["oneYear"] = _.sortBy(dataArr, 'measure').reverse();
                var allYears = _.groupBy(countyData.find({county_name: {$in:selectedZoneArray}}).fetch(), 'sim_year');
                var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');


                //this if statement determines if the chart draws the generic all region series
                //or the series for that particular zone. selectedZone will be length 0 when nothing is selected
                if(Session.get('selectedZone').length > 0){
                    chartData = _.keys(allYears).map(function(key){
                        var simData = allYears[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }else{
                    chartData = _.keys(counties).map(function(key){
                        var simData = counties[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }



                dataDict["allYears"] = chartData;
                Session.set("selectedData", dataDict);


                drawChart(dataDict.allYears);

            }
        });
    }

    export function subscribeToUrbanCenter(year, selectedZoneArray){
        return Meteor.subscribe('grouped_urban_centers', selectedZoneArray, {
            onReady: function(){
                var fieldObj = getDataFields(Roles.userIsInRole(Meteor.userId(), ['admin']));
                var data;
                var baseData;

                if(Session.get('selectedZone').length > 0){
                    data = ucSummary.find({sim_year: year, NAME:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                    baseData = ucSummary.find({sim_year: 2010, NAME:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                }else{
                    data = countyData.find({sim_year: year}, {fields:fieldObj}).fetch();
                    baseData = countyData.find({sim_year: 2010}, {fields:fieldObj}).fetch();
                }

                this.stop();
                var dataArr =[];

                //functional programming way of creating the right data object
                if(data.length > 0){
                    dataArr = _.keys(data[0]).map(function(key){
                        var value = data.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        var baseValue = baseData.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        return {measure: key, value:parseInt(value[key]), diff: parseInt(value[key]) - parseInt(baseValue[key])};
                    });
                }


                var dataDict = {};
                var chartData;



                dataDict["oneYear"] = _.sortBy(dataArr, 'measure').reverse();
                var allYears = _.groupBy(ucSummary.find({NAME:{$in:selectedZoneArray}}).fetch(), 'sim_year');
                var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');


                //this if statement determines if the chart draws the generic all region series
                //or the series for that particular zone. selectedZone will be length 0 when nothing is selected
                if(Session.get('selectedZone').length > 0){
                    chartData = _.keys(allYears).map(function(key){
                        var simData = allYears[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }else{
                    chartData = _.keys(counties).map(function(key){
                        var simData = counties[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }



                dataDict["allYears"] = chartData;
                Session.set("selectedData", dataDict);


                drawChart(dataDict.allYears);

            }
        });
    }

    export function drawChart(data){
        console.log(data);
        d3.selectAll(".svgChart").remove();
        var margin = {top: 10, right:25, bottom:25, left:90},
            width = 350 - margin.left - margin.right,
            height = 220 - margin.top - margin.bottom;

        var x = d3.scale.linear().range([0, width]);
        var y_pop = d3.scale.linear().range([height, 0]);
        var y_emp = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.format('d'));

        var yAxis = d3.svg.axis()
            .scale(y_pop)
            .orient("left");

        var yAxis_emp = d3.svg.axis()
            .scale(y_emp)
            .orient("left");

        var line_pop = d3.svg.line()
            .x(function(d){return x(d.sim_year)})
            .y(function(d){return y_pop(d.pop_sim)});

        var line_emp = d3.svg.line()
            .x(function(d){return x(d.sim_year)})
            .y(function(d){return y_emp(d.emp_sim)});


        var svg = d3.select("#popChartContainer").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .attr("class", "svgChart")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var svg_emp = d3.select("#hhChartContainer").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .attr("class", "svgChart")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        x.domain([2010, 2040]);
        y_pop.domain(d3.extent(data, function(d){return d.pop_sim}));
        y_emp.domain(d3.extent(data, function(d){return d.emp_sim}));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Population");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line_pop);

        svg_emp.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg_emp.append("g")
            .attr("class", "y axis")
            .call(yAxis_emp)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Employment");

        svg_emp.append("path")
            .datum(data)
            .attr("class", "lineEmp")
            .attr("d", line_emp)


    }

    export function colorCesiumMap(data, measure){

        var max = _.max(data, function (x) {
            return x[measure]
        })[measure];


        var quantize = d3.scale.quantize()
            .domain([0, max])
            .range(d3.range(7).map(function (i) {
                return i;
            }));

        var colorMap = {
            0: "#eff3ff",
            1: "#85B3D4",
            2: "#6C9DC7",
            3: "#5387BA",
            4: "#3A71AD",
            5: "#215BA0",
            6: "#084594"
        };

        var ds = viewer.dataSources.get(0);
        var layer = Session.get('selectedLayer');
        data.forEach(function(cv, idx, arr){
            if(layer == 'zonesGeo'){
                var entity = _.find(ds.entities.values, function(x){return x.properties.ZONE_ID == cv.zone_id});
                var quantized = quantize(cv[measure]);
                var color = colorMap[quantized];
                cv['color'] = color;
                entity.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(0.5);
            }else if(layer == 'municipalities'){
                var entity = undefined;
                ds.entities.values.forEach(function(ent){
                    if(ent.properties.CITY == cv.city_name){
                        var quantized = quantize(cv[measure]);
                        var color = colorMap[quantized];
                        cv['color'] = color;
                        ent.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(0.5);
                    }
                });
            }else if(layer == 'county_web'){
                var entity = undefined;
                ds.entities.values.forEach(function(ent){
                    if(ent.properties.COUNTY == cv.county_name){
                        var quantized = quantize(cv[measure]);
                        var color = colorMap[quantized];
                        cv['color'] = color;
                        ent.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(0.5);
                    }
                });
            }else{
                var entity = undefined;
                ds.entities.values.forEach(function(ent){
                    if(ent.properties.NAME == cv.NAME){
                        console.log(cv)
                        var quantized = quantize(cv[measure]);
                        var color = colorMap[quantized];
                        cv['color'] = color;
                        ent.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(0.5);
                    }
                });
            }



        });

        var legendData = [];
        for(var i=0; i < 7; i++){
            legendData.push({
                name: parseInt(quantize.invertExtent(i)[0]) + " - " + parseInt(quantize.invertExtent(i)[1]),
                color: colorMap[i]
            });
        }

        Session.set('queryColorRanges', legendData);

        //Session.set('colorData', data.map(function(x){return {zone_id: x.zone_id, color: x.color}}));






    }

    export function colorBuildings(){

        var buildingColors = {
            single_family_residential: "#D99937",
            condo: "#A22E3B",
            apartment: "#E95D22",
            townhome: "#4490AF",
            mobile_home: "#626262",
            retail: "#1D4E89",
            warehousing: "#FBC254",
            agriculture: "#DECDBF",
            office: "#739B4E",
            "quasi-public": "#9D8169",
            industrial: "#9E61B0",
            restaurant: "#B5BF4F",
            school: "#CF5D6B",
            recreation: "#4CAF50",
            parking: "#5F5F5F",
            tcu: "#F66CA8",
            "mixed use with residential": "#753D16",
            mixed_use: "#8AD9DE",
            hospital: "#1655AC",
            group_quarters: "#EBC76C",
            lodging: "#513D27",
            casino: "#59F2A7",
            military: "#0C0202"
        };
        console.log('test');

        for(i=1; i<viewer.dataSources.length; i++){
            //start at index 1 because index 0 is going to be the polygon shapes of the layer
            var dataSource = viewer.dataSources.get(i);
            dataSource.entities.values.forEach(function(cv){
                var building_type = cv.properties._building_;
                var color =buildingColors[building_type];
                if(color){
                    cv.polygon.material = Cesium.Color.fromCssColorString(color);
                    cv.polygon.outlineColor = Cesium.Color.fromCssColorString(color);
                    cv.polygon.extrudedHeight = cv.properties.Bldg_Heigh / 3.2;
                }

            });
        }
    }

    export function resetBuildings(){
        for(i=1; i<viewer.dataSources.length; i++){
            //start at index 1 because index 0 is going to be the polygon shapes of the layer
            var dataSource = viewer.dataSources.get(i);
            dataSource.entities.values.forEach(function(cv){
                cv.polygon.material = Cesium.Color.BURLYWOOD;
                cv.polygon.outlineColor = Cesium.Color.BLACK;
                cv.polygon.outlineWidth = 1.0
            });
        }
    }

    export function addSource(source, response){
        source.load({
            type: "FeatureCollection",
            crs: {
                type: "name",
                properties: {
                    name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            features: response
        });
        var entities = source.entities.values;


        if(Session.equals('styleBuildings',  true)){
            colorBuildings();
        }else{
            for(var i =0; i<entities.length; i++) {
                var entity = entities[i];
                entity.polygon.extrudedHeight = entity.properties.Bldg_Heigh / 3.2;
                entity.polygon.material = Cesium.Color.BURLYWOOD;
                entity.polygon.outlineColor = Cesium.Color.BLACK;
                entity.polygon.outlineWidth = 1.0
            }
        }
        Session.set('spinning', false);
    }

    export function addNewBuildings(source, response){
        source.load({
            type: "FeatureCollection",
            crs: {
                type: "name",
                properties: {
                    name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            features: response
        });
        var entities = source.entities.values;


        for(var i =0; i<entities.length; i++) {
            var entity = entities[i];
            entity.polygon.extrudedHeight = entity.properties.height * 3;
            entity.polygon.material = Cesium.Color.RED;
            entity.polygon.outlineColor = Cesium.Color.BLACK;
        }

        Session.set('spinning', false);
    }

    export function addParcels(source, response){
        source.load({
            type: "FeatureCollection",
            crs: {
                type: "name",
                properties: {
                    name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            features: response
        });
        var entities = source.entities.values;
        var selection = [];
        var scenario = Session.get('selectedScenario');
        var query = scenarios.findOne({scenarioName:scenario});
        var scenarioItems;
        var scenarioParcelIds;
        if(query){
            if(query.hasOwnProperty('parcels')){
                scenarioItems = [].concat.apply([], scenarios.findOne({scenarioName:scenario}).parcels);
                scenarioParcelIds = _.pluck(scenarioItems, 'parcel_id');
            }
            
        }
        

        for(var i =0; i<entities.length; i++) {
            var entity = entities[i];
            //var selectionItem = {parcelId: entity.properties.parcel_id, far: entity.properties._far};
            var selectionItem = entity.properties;
            //set the visual properties of the selection
            var far;
            if(_.contains(scenarioParcelIds, entity.properties.parcel_id)){
                far = _.find(scenarioItems, function(x){ return x.parcel_id == entity.properties.parcel_id}).far;

            }else{
                far = entity.properties._far
            }

            if(far > 0){
                entity.polygon.material = Cesium.Color.BLUE;
                entity.polygon.outlineColor = Cesium.Color.BLACK;
                entity.polygon.extrudedHeight = Math.ceil(far) * 15;
            }else{
                entity.polygon.material = Cesium.Color.DARKORANGE;
                entity.polygon.outlineColor = Cesium.Color.BLACK;
            }

            selection.push(selectionItem);

        }
        Session.set('scenarioSelection', selection);
    }

    export function zoningScenarioClickEvents() {
        hand.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        hand.setInputAction(function(click){
            Session.set('spinning', true);
            var pickedObject = viewer.scene.pick(click.position);
            var entity = pickedObject.id;
            console.log(entity);

            var dataSourcesCount = viewer.dataSources.length - 1;
            for(var i=dataSourcesCount; i> 0; i--){
                viewer.dataSources.remove(viewer.dataSources.get(i), true);
            }

            var source = new Cesium.GeoJsonDataSource('parcels');

            if(entity.properties.hasOwnProperty('UNIQUE_ID')){
                var urban_cen = entity.properties.NAME;
                Session.set('selectedZone', urban_cen);
                Meteor.call('findParcelsInUc', urban_cen, function(error, response){
                    if(error){
                        Session.set('spinning', false);
                        Materialize.toast(error.reason, 5000);
                    }else{
                        Session.set('spinning', false);
                        Session.set('parcelCount', response.length);
                        viewer.dataSources.add(source);
                        addParcels(source, response);
                    }
                });
            }else{
                var zoneId = entity.properties.ZONE_ID;
                Session.set('selectedZone', zoneId);
                Meteor.call('getParcelsInZone', zoneId, function(error, response){
                    if(error){
                        Session.set('spinning', false);
                        Materialize.toast(error.reason, 5000);
                    }else{
                        Session.set('spinning', false);
                        Session.set('parcelCount', response.length);
                        viewer.dataSources.add(source);
                        addParcels(source, response);
                    }

                });
            }



        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }


    var lat;
    var long;
    var originLat;
    var originLong;
    var counter = 0;
    var pointArr = [];
    var centroids = undefined;
    export function drawBoundariesClickEvents(){
        hand.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        hand.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        hand.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        hand.setInputAction(function(click){
            counter = counter + 1;
            var cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
            if(cartesian){
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                long = Cesium.Math.toDegrees(cartographic.longitude);
                lat = Cesium.Math.toDegrees(cartographic.latitude);
                pointArr.push([long, lat]);
                if(counter == 1){
                    originLong = Cesium.Math.toDegrees(cartographic.longitude);
                    originLat = Cesium.Math.toDegrees(cartographic.latitude);
                }
                viewer.entities.add({
                    id: counter,
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray([long, lat, long, lat]),
                        width: 2,
                        material: Cesium.Color.RED
                    }


                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        hand.setInputAction(function(movement){
            $('#cesiumContainer').css('cursor', 'crosshair');
            var line = viewer.entities.getById(counter);
            if(line){

                var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
                if(cartesian){
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    newLong = Cesium.Math.toDegrees(cartographic.longitude);
                    newLat = Cesium.Math.toDegrees(cartographic. latitude);

                }

                line.polyline.positions = Cesium.Cartesian3.fromDegreesArray([long, lat, newLong, newLat ])
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        hand.setInputAction(function(rightClick){
            counter = counter + 1;
                    var cartesian = viewer.camera.pickEllipsoid(rightClick.position, viewer.scene.globe.ellipsoid);
                    if(cartesian){
                        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        newlong = Cesium.Math.toDegrees(cartographic.longitude);
                        newLat = Cesium.Math.toDegrees(cartographic. latitude);
                    }

                    pointArr.push([newlong, newLat]);
                    pointArr.push([originLong, originLat]);

                    viewer.entities.add({
                        id: counter,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArray([newLong, newLat, originLong, originLat]),
                            width: 2,
                            material: Cesium.Color.RED,
                            outline: Cesium.Color.RED
                        }
                    });

            var source = viewer.dataSources.get(1);
            var entities = source.entities.values;

            var parcelIds = _.map(entities, function(x){ return x.properties.parcel_id});
            
            var zoneId = Session.get('selectedZone');
            if(centroids){
                centroids.stop();
                centroids = Meteor.subscribe('parcels_poly_selection', parcelIds, pointArr, {
                    onReady: function(){
                        ParcelSubOnReady();
                    }
                });
            }else{
                centroids = Meteor.subscribe('parcels_poly_selection', parcelIds, pointArr, {
                    onReady: function(){
                        ParcelSubOnReady();
                    }
                });
            }


            //remove boundary line before drawing the new selection
            for(var i=0; i < counter +1; i++){
                var line = viewer.entities.getById(i);
                if(line){
                    viewer.entities.remove(line);
                }
            }
            pointArr = [];
            counter = 0;
            $('#cesiumContainer').css('cursor', 'default');
            hand.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            hand.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

            zoningScenarioClickEvents();


        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    function ParcelSubOnReady(){
        var parcelIds = _.map(parcel_centroids.find({}).fetch(), function(parcel){
            return parcel.properties.parcel_id;
        });



        var source = viewer.dataSources.get(1);
        var entities = source.entities.values;
        var selection = [];

        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if(_.contains(parcelIds, entity.properties.parcel_id)){
                // var selectionItem = {parcelId: entity.properties.parcel_id, far: entity.properties._far};
                var selectionItem = entity.properties;

                selection.push(selectionItem);
                entity.polygon.material = Cesium.Color.BLUE;
                entity.polygon.outlineColor = Cesium.Color.BLACK;
            }else{
                entity.polygon.material = Cesium.Color.GRAY;
                entity.polygon.outlineColor = Cesium.Color.BLACK;
            }
        }

        Session.set('scenarioSelection', selection);
        Session.set('parcelCount', selection.length);


    }


}